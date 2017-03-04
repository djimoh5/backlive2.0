import { QueueOperators } from '../event/event-queue';
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent, TrainingDataEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';
import { ISession } from '../../core/lib/session';

import { NodeService } from '../../core/service/node.service';
import { Node, Activation, ActivationError } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

import { Stats } from '../lib/stats';

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    protected node: T;
    private outputs: string[] = [];

    state: State;
    pastState: { [key: string]: State };
    learningError: LearningError;

    private nodeService: NodeService<T>;

    private subscribedTypes: { [key: number]: boolean  } = {};

    constructor(node: T, serviceType?: typeof NodeService) {
        if(serviceType) {
            this.nodeService = new serviceType(new MockSession({ uid: node.uid }));
        }

        if(node && this.nodeService) {
            this.setNode(node);
        }
        else {
            this.nodeId = Common.uniqueId();
        }
    }

    setNode(node: T) {
        node._id = node._id.toString();
        this.node = node;
        this.nodeId = node._id;
        this.state = new State();
        this.pastState = {};

        if(node.inputs) {
            this.nodeService.getInputs(node._id).then(nodes => {
                var inputNodes = this.updateInputs(nodes); 
                if(this.onUpdateInputs) { this.onUpdateInputs(inputNodes); }

                if(this.numOutputs() > 0) {
                    this.unsubscribe(TrainingDataEvent);
                }
            });

            this.unsubscribe(UpdateNodeWeightsEvent);
            this.subscribe(UpdateNodeWeightsEvent, event => this.updateWeights(event.data));
        }
        else {
            setTimeout(() => { //have to run on next turn or onUpdateInputs won't be set yet
                if(this.onUpdateInputs) { this.onUpdateInputs({}); }
            });
        }
        
        //event input nodes (nodes without inputs) still need to listen so they can fire we are complete
        this.unsubscribe(BackpropagateEvent);
        this.subscribe(BackpropagateEvent, 
            event => this.backpropagate(event), 
            { filter: (event, index) => { return Common.inArray(event.senderId, this.outputs); } }
        );
    }

    getNode(): Node {
        return this.node;
    }

    updateInputs(nodes: Node[]) {
        for(var k in this.subscribedTypes) {
            var key: any = k;
            this.unsubscribe(NodeConfig.activationEvent(key));
            delete this.subscribedTypes[k];
        }
         
        var inputNodes = {};

        nodes.forEach(n => {
            inputNodes[n._id] = n;
            
            if(!this.subscribedTypes[n.ntype]) {
                this.subscribe(NodeConfig.activationEvent(n.ntype),
                    event => {
                        this.state.date = event.date;
                        this.state.inputActivations[event.senderId] = event.data;
                        this.receive(event);
                    }, 
                    { filter: (event, index) => { return Common.inArray(event.senderId, this.node.inputs); } }
                );
                this.subscribedTypes[n.ntype] = true;
            }
        });

        return inputNodes;
    }

    updateOutput(node: Node) {
        if(this.outputs.indexOf(node._id) < 0) {
            this.outputs.push(node._id);
        }
    }

    onUpdateInputs: (nodes: { [key: string]: Node }) => void;

    protected abstract receive(event: ActivateNodeEvent);

    protected activate(event?: ActivateNodeEvent, useLinear: boolean = false) {
        if(!event) {
            for(var i = 0, len = this.node.inputs.length; i < len; i++) {
                if(!this.state.inputActivations[this.node.inputs[i]]) {
                    this.state.activation = null;
                    return; //must first have an activation of all inputs to activate yourself
                }
            }

            if(!this.node.weights) {
                this.initializeWeights();
            }

            var activation: Activation = {};
            var first: boolean = true;

            var keys = this.state.inputActivations[this.node.inputs[0]];

            this.node.inputs.forEach((id, i) => {
                var inActivation = this.state.inputActivations[id];
                for(var k in keys) {
                    if(typeof(inActivation[k]) !== 'undefined') {
                        if(first) {
                            activation[k] = this.node.bias;
                            this.learningError.trainingCount++; //# of training data, used to update weights
                        }

                        activation[k] += this.node.weights[i] * inActivation[k];
                    }
                    else {
                        delete activation[k];
                        delete keys[k];
                    }
                }

                first = false;
            });

            if(!useLinear) { //CREATE A SEPARATE CLASS THAT HANDLES VARIOUS ACTIVATION TYPES, E.G. TANH, SIGMOID, REL, LINEAR
                for(var k in activation) {
                    activation[k] = this.sigmoid(activation[k]);
                }
            }

            event = new ActivateNodeEvent(activation, this.state.date);
        }

        this.persistActivation(event);
        this.notify(event);
        //console.log('node', this.node.name, 'activated');
    }

    persistActivation(event: ActivateNodeEvent) {
        this.state.activation = event.data;
        this.pastState[event.date] = this.state;
        this.state = new State();
    }

    protected backpropagate(event: BackpropagateEvent) {
        var state: State = this.pastState[event.date];
        var delta: Activation = {};

        if(event.data.weights) {
            state.activationErrors[event.senderId] = event.data;

            for(var i = 0, len = this.outputs.length; i < len; i++) {
                if(!state.activationErrors[this.outputs[i]]) {
                    return; //must have backpropagation error from all your outputs to backpropagate yourself
                }
            }
            
            if(!this.node.inputs) {
                //no inputs, so must be at input layer
                this.notify(new BackpropagateCompleteEvent(null, event.date));
                return; 
            }

            for(var id in state.activationErrors) {
                var activationError = state.activationErrors[id];
                for(var k in activationError.error) {
                    var sig = state.activation[k];
                    var sigPrime = sig * (1 - sig);

                    if(!delta[k]) { delta[k] = 0; }
                    delta[k] += activationError.weights[this.node._id] * activationError.error[k] * sigPrime;
                }
            }
        }
        else {
            //means output node called backpropagate to itself
            delta = event.data.error;
        }

        var weights: { [key: string]: number };

        if(this.node.weights) {
            var first: boolean = true;
            weights = {};

            this.node.weights.forEach((w, index) => {
                weights[this.node.inputs[index]] = w; //store your weights so next layer can compute their responsibility
                var inActivation = state.inputActivations[this.node.inputs[index]];
                
                for(var k in delta) { //delta with respect to weight (which uses incoming activation at weight)
                    this.learningError.total[index] += delta[k] * inActivation[k];
                    if(first) { this.learningError.totalBias += delta[k]; }
                }

                first = false;
            });
        }

        this.notify(new BackpropagateEvent({ error: delta, weights: weights }, event.date));
        //console.log('backpropagating node ', this.node._id, { error: delta, weights: weights });
    }

    private initializeWeights() {
        var len = this.node.inputs.length;
        if(len > 1) {
            this.node.bias = Stats.randomNormalDist(0, 1);
            this.node.weights = [];
            var cnt = len;

            while(cnt-- > 0) {
                var weight = Stats.randomNormalDist(0, 1 / Math.sqrt(len));
                this.node.weights.push(weight);
            }

            this.resetError();
        }
    }

    updateWeights(learningRate: number) {
        if(this.node.weights) {
            this.node.weights.forEach((w, index) => {
                this.node.weights[index] = w - (learningRate * this.learningError.total[index] / this.learningError.trainingCount);
            });

            this.node.bias = this.node.bias - (learningRate * this.learningError.totalBias / this.learningError.trainingCount);
            
            this.resetError();

            //console.log(this.node._id, 'weights:', this.node.weights, 'bias:', this.node.bias);
        }
    }

    private resetError() {
        this.learningError = new LearningError();

        this.node.weights.forEach(w => {
            this.learningError.total.push(0);
        });

        this.learningError.trainingCount = 0;
    }

    protected sigmoid(x: number, derivative: boolean = false) {
        var val = 1 / (1 + Math.exp(-x));
        return derivative ? (val * (1 - val)) : val;
    }

    subscribe<TT extends BaseEvent<any>>(eventType: TypeOfBaseEvent<TT>, callback: BaseEventCallback<TT>, operators?: QueueOperators<TT>) {
        return AppEventQueue.subscribe(eventType, this.nodeId, callback, operators);
    }

    unsubscribe<TT extends BaseEvent<any>>(eventType: TypeOfBaseEvent<TT>) {
        return AppEventQueue.unsubscribe(this.nodeId, eventType);
    }
    
    notify(event: BaseEvent<any>) {
        event.senderId = this.nodeId;
        AppEventQueue.notify(event);
    }

    numOutputs() {
        return this.outputs.length;
    }

    static forEachKey<T>(obj: { [key: string]: T }, fn: (obj: T) => void) {
        for(var key in obj) {
            fn(obj[key]);
        }
    }
}

export class MockSession implements ISession {
    user: { uid: string };
    cookies: any;
    
    constructor(user: { uid: string }) {
        this.user = user;
    }
}

export enum Normalize {
    PercentRank = 1
}

class State {
    date: number;
    activation: Activation = {};
    inputActivations: { [key: string]: Activation } = {}; //nodeId => Activation
    activationErrors: { [key: string]: ActivationError } = {};
}

class LearningError {
    totalBias: number = 0; 
    total: number[] = [];
    trainingCount: number = 0;
}