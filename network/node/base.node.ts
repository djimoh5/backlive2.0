import { QueueOperators } from '../event/event-queue'
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent, TrainingDataEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';
import { ISession } from '../../core/lib/session';

import { NodeService } from '../../core/service/node.service';
import { Node, Activation } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

import { Stats } from '../lib/stats';

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    protected node: T;
    private inputNodes: { [key: string]: Node } = {};
    private outputNodes: { [key: string]: Node } = {};

    private inputActivations: Activation[];
    private totalError: number[];
    private trainingCount: number;
    
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

        if(node.inputs) {
            this.nodeService.getInputs(node._id).then(nodes => {
                this.updateInputs(nodes); 
                if(this.onUpdateInputs) { this.onUpdateInputs(this.inputNodes); }

                if(this.hasOutputs()) {
                    this.unsubscribe(TrainingDataEvent);
                }
            });

            this.unsubscribe(UpdateNodeWeightsEvent);
            this.subscribe(UpdateNodeWeightsEvent, event => this.updateWeights(event.data));
        }
        else {
            setTimeout(() => { //have to run on next turn or onUpdateInputs won't be set yet
                if(this.onUpdateInputs) { this.onUpdateInputs(this.inputNodes); }
            });
        }
        
        //event input nodes (nodes without inputs) still need to listen so they can fire we are complete
        this.unsubscribe(BackpropagateEvent);
        this.subscribe(BackpropagateEvent, 
            event => this.backpropagate(event), 
            { filter: (event, index) => { return this.outputNodes[event.senderId] ? true : false; } }
        );
    }

    getNode(): T {
        return this.node;
    }

    updateInputs(nodes: Node[]) {
        for(var key in this.inputNodes) {
            this.unsubscribe(NodeConfig.activationEvent(this.inputNodes[key].ntype));
            delete this.subscribedTypes[this.inputNodes[key].ntype]
        }
         
        this.inputNodes = {};

        nodes.forEach(n => {
            this.inputNodes[n._id] = n;
            
            if(!this.subscribedTypes[n.ntype]) {
                this.subscribe(NodeConfig.activationEvent(n.ntype), 
                    event => {
                        this.inputNodes[event.senderId].activation = event.data;
                        this.receive(event);
                    }, 
                    { filter: (event, index) => { return Common.inArray(event.senderId, this.node.inputs); } }
                );
                this.subscribedTypes[n.ntype] = true;
            }
        });
    }

    updateOutput(node: Node) {
        this.outputNodes[node._id] = node;
    }

    onUpdateInputs: (nodes: { [key: string]: Node }) => void;

    protected abstract receive(event: ActivateNodeEvent);

    protected activate(event?: ActivateNodeEvent, useLinear?: boolean) {
        if(!event) {
            var activation: Activation = {};

            if(!this.node.weights) {
                this.initializeWeights();
            }

            for(var i = 0, len = this.node.inputs.length; i < len; i++) {
                var id = this.node.inputs[i];
                var inActivation = this.inputNodes[id].activation;

                if(!inActivation) {
                    this.node.activation = null;
                    return; //must first have an activation of all inputs to activate yourself
                }

                for(var k in inActivation) {
                    if(!activation[k]) {
                        activation[k] = 0;
                    }

                    activation[k] += this.node.weights[i] * inActivation[k];
                }
            }

            if(!useLinear) {
                for(var k in activation) {
                    activation[k] = this.sigmoid(activation[k]);
                }
            }

            event = new ActivateNodeEvent(activation);

            //store activation for each input, needed later for backpropagation
            var first: boolean = true;
            this.inputActivations = [];
            this.node.inputs.forEach((id, index) => {
                this.inputActivations[index] = {};

                for(var key in this.inputNodes[id].activation) {
                    this.inputActivations[index][key] = this.inputNodes[id].activation[key];
                    if(first) {
                        this.trainingCount++; //# of training data, used to update weights
                    }
                }

                this.inputNodes[id].activation = null; //clear out activation
                first = false;
            });
        }

        this.node.activation = event.data;
        
        this.notify(event);

        //console.log('node', this.node.name, 'activated');
    }

    protected backpropagate(event: BackpropagateEvent) {
        if(this.node.inputs) {
            var data = event.data;
            var delta: Activation = {};

            if(data.weights) {
                this.outputNodes[event.senderId].activationError = data;
                
                for(var key in this.outputNodes) {
                    data = this.outputNodes[key].activationError;

                    if(!data) {
                        return; //must have backpropagation from all your outputs to backpropagate yourself
                    }

                    for(var key in data.error) {
                        delta[key] = data.error[key] * data.weights[this.node._id];
                    }
                }
            }
            else {
                delta = data.error;
            }

            for(var key in this.node.activation) { //average sigmoid derivative across keys (these are not inputs!)
                var sig = this.node.activation[key];
                delta[key] *= sig * (1 - sig); //sigmoid prime
            }

            if(this.node.weights) {
                var weights: { [key: string]: number } = {}; //store your weights so next layer can compute their responsibility
                this.node.weights.forEach((w, index) => {
                    weights[this.node.inputs[index]] = w;

                    for(var key in this.inputActivations[index]) {
                         this.totalError[index] += delta[key] * this.inputActivations[index][key];
                    }
                });
            }

            this.notify(new BackpropagateEvent({ error: delta, weights: weights }));

            for(var key in this.outputNodes) { //clear out your output backpropagate errors
                this.outputNodes[key].activationError = null;
            }

            //console.log('backpropagating node ', this.node._id, { error: delta, weights: weights });
        }
        else {
            //no inputs, so must be at input layer
            this.notify(new BackpropagateCompleteEvent(null));
        }
    }

    private initializeWeights() {
        var len = this.node.inputs.length;
        if(len > 1) {
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
                //console.log(w, this.totalError[index], this.trainingCount);
                this.node.weights[index] = w - (learningRate * this.totalError[index] / this.trainingCount);
            });

            this.resetError();

            //console.log(this.node._id, 'new weights', this.node.weights);
        }
    }

    private resetError() {
        this.totalError = [];

        this.node.weights.forEach(w => {
            this.totalError.push(0);
        });

        this.trainingCount = 0;
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

    getInputNodes() {
        return this.inputNodes;
    }

    hasOutputs() {
        return Common.hasKeys(this.outputNodes);
    }

    numOutputs() {
        var cnt = 0;
        for(var key in this.outputNodes) {
            cnt++;
        }

        return cnt;
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