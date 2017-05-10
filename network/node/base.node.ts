import { QueueOperators } from '../event/event-queue';
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent, TrainingDataEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';
import { ISession } from '../../core/lib/session';

import { NodeService } from '../../core/service/node.service';
import { VirtualNodeService } from './basic/virtual-node.service';

import { Node, Activation, ActivationError } from '../../core/service/model/node.model';

import { Stats } from '../lib/stats';

import { Network } from '../network';
import { ProcessWrapper } from '../process-wrapper';

declare var process;

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    protected node: T;
    protected outputs: string[] = [];

    state: State;
    pastState: { [key: string]: State };
    learningError: LearningError;

    totalCost: number = 0;
    trainingCount = 0;

    private nodeService: NodeService<T>;

    process: ProcessWrapper;

    constructor(node: T, serviceType?: typeof NodeService) {
        if(serviceType) {
            var session = new MockSession({ uid: (node ? node.uid : null) });
            this.nodeService = VirtualNodeService.pid ? new VirtualNodeService(session) : new serviceType(session);
        }

        if(node && this.nodeService) {
            this.setNode(node);
        }
        else {
            this.nodeId = Common.uniqueId();
            if(node) {
                node._id = this.nodeId;
                this.node = node;
            }
        }

        this.subscribe(BackpropagateEvent, event => this.backpropagate(event), 
            { filter: (event, index) => { return Common.inArray(event.senderId, this.outputs); } }
        );

        this.clearState();
    }

    clearState() {
        this.state = new State();
        this.pastState = {};
    }

    setNode(node: T) {
        node._id = node._id.toString();
        this.node = node;
        this.nodeId = node._id;
        this.clearState();

        if(node.inputs) {
            this.nodeService.getInputs(node._id).then(nodes => {
                this.updateInputs(nodes); 
                if(this.onUpdateInputs) { this.onUpdateInputs(nodes); }

                if(this.numOutputs() > 0) {
                    this.unsubscribe(TrainingDataEvent);
                }
            });

            this.unsubscribe(UpdateNodeWeightsEvent);
            this.subscribe(UpdateNodeWeightsEvent, event => this.updateWeights(event.data));
        }
        else {
            setTimeout(() => { //have to run on next turn or onUpdateInputs won't be set yet
                if(this.onUpdateInputs) { this.onUpdateInputs([]); }
            });
        }
    }

    useProcess(process: ProcessWrapper) {
        this.process = process;
        this.process.addNode(this.node, this.outputs);
    }

    getNode(): Node {
        return this.node;
    }

    updateInputs(nodes: Node[]) {
        this.unsubscribe(ActivateNodeEvent);
        this.subscribe(ActivateNodeEvent,
            event => {
                this.state.date = event.date;
                this.state.inputActivations[event.senderId] = event.data;
                delete this.pastState[event.date];

                var duration = Date.now() - event.created;
                if(!event['time'] || duration > event['time']) {
                    duration = duration - (event['time'] ? event['time'] : 0);
                    Network.timings.event += duration;
                }
                
                this.receive(event);              
            }, 
            { filter: (event, index) => { return Common.inArray(event.senderId, this.node.inputs); } }
        );
    }

    updateOutput(node: Node) {
        if(this.outputs.indexOf(node._id) < 0) {
            this.outputs.push(node._id);
        }
    }

    setOutputs(outputs: string[]) {
        this.outputs = outputs;
    }

    onUpdateInputs: (nodes: Node[]) => void;

    protected abstract receive(event: ActivateNodeEvent);

    protected activate(event?: ActivateNodeEvent, useLinear: boolean = false) {
        var startTime = Date.now();

        if(!event) {
            for(var i = 0, len = this.node.inputs.length; i < len; i++) {
                if(!this.state.inputActivations[this.node.inputs[i]]) {
                    Network.timings.activation += Date.now() - startTime;
                    return; //must first have an activation of all inputs to activate yourself
                }
            }

            if(!this.node.weights) {
                this.initializeWeights();
            }

            var activation = new Activation();
            var weightIndex = 0;

            this.node.inputs.forEach(id => {
                var inActivation = this.state.inputActivations[id].vals;
                this.activateMatrix(activation, inActivation, weightIndex);
                weightIndex += inActivation[0].length;
            });

            this.learningError.trainingCount += activation.vals.length;

            if(!useLinear) { //CREATE A SEPARATE CLASS THAT HANDLES VARIOUS ACTIVATION TYPES, E.G. TANH, SIGMOID, REL, LINEAR
                activation.vals.forEach(input => {
                    input[0] = this.sigmoid(input[0] + this.node.bias);
                });
            }

            activation.keys = this.state.inputActivations[this.node.inputs[0]].keys;
            event = new ActivateNodeEvent(activation, this.state.date);
        }

        this.persistActivation(event);
        Network.timings.activation += Date.now() - startTime;
        this.notify(event);
        //console.log('node', this.node.name, 'activated');
    }

    activateMatrix(activation: Activation, inActivation: number[][], startWeightIndex: number) {
        inActivation.forEach((input, row) => {
            if(!activation.vals[row]) {
                activation.vals[row] = [0];
            }

            var weightIndex = startWeightIndex;
            input.forEach(feature => {
                activation.vals[row][0] += feature * this.node.weights[weightIndex++];
            });
        });
    }

    persistActivation(event: ActivateNodeEvent) {
        this.state.activation = event.data;
        this.pastState[event.date] = this.state;
        this.state = new State();
    }

    protected backpropagate(event: BackpropagateEvent) {
        var startTime = Date.now();

        var state: State = this.pastState[event.date];
        var delta = new Activation();

        if(event.data.weights) {
            state.activationErrors[event.senderId] = event.data;

            for(var i = 0, len = this.outputs.length; i < len; i++) {
                if(!state.activationErrors[this.outputs[i]]) {
                    Network.timings.backpropagation += Date.now() - startTime;
                    return; //must have backpropagation error from all your outputs to backpropagate yourself
                }
            }
            
            if(!this.node.inputs) {
                //no inputs, so must be at input layer
                Network.timings.backpropagation += Date.now() - startTime;
                this.notify(new BackpropagateCompleteEvent(null, event.date));
                return; 
            }

            var weightIndex = 0;
            for(var id in state.activationErrors) {
                this.backpropagateMatrix(delta, state.activationErrors[id], state.activation, weightIndex);
            }
        }
        else {
            //means output node called backpropagate to itself
            delta = event.data.error;
        }

        var weights: { [key: string]: number };

        if(this.node.weights) {
            var startWeightIndex = 0;
            weights = {};

            this.node.inputs.forEach(id => {
                weights[id] = this.node.weights[startWeightIndex]; //store your weights so next layer can compute their responsibility
                var inActivation = state.inputActivations[id];
                
                inActivation.vals.forEach((input, row) => { //delta with respect to weight (which uses incoming activation at weight)
                    if(startWeightIndex === 0) { 
                        this.learningError.totalBias += delta.vals[row][0];
                    }

                    var weightIndex = startWeightIndex;
                    input.forEach(feature => {
                        this.learningError.total[weightIndex++] += delta.vals[row][0] * feature;
                    });
                });

                startWeightIndex += inActivation.vals.length;
            });
        }

        Network.timings.backpropagation += Date.now() - startTime;
        this.notify(new BackpropagateEvent({ error: delta, weights: weights }, event.date));
        //console.log('backpropagating node ', this.node.name, VirtualNodeService.pid);
    }

    backpropagateMatrix(delta: Activation, activationError: ActivationError, activation: Activation, weightIndex: number) {
        var errorActivation = activationError.error.vals;
        errorActivation.forEach((input, index) => {
            if(!delta.vals[index]) {
                delta.vals[index] = [0];
            }

            var sig = activation.vals[index][0];
            var sigPrime = sig * (1 - sig);

            delta.vals[index][0] += errorActivation[index][0] * activationError.weights[this.node._id] * sigPrime;
        });
    }

    private initializeWeights() {
        var len = this.node.inputs.length;

        if(len === 1 && this.state.inputActivations[this.node.inputs[0]].vals[0].length > 1) {
            len = this.state.inputActivations[this.node.inputs[0]].vals[0].length;
        }

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
        var startTime = Date.now();

        if(this.node.weights) {
            this.node.weights.forEach((w, index) => {
                this.node.weights[index] = w - (learningRate * this.learningError.total[index] / this.learningError.trainingCount);
            });

            this.node.bias = this.node.bias - (learningRate * this.learningError.totalBias / this.learningError.trainingCount);
            
            this.resetError();

            //console.log(this.node._id, 'weights:', this.node.weights, 'bias:', this.node.bias);
        }

         Network.timings.weight += Date.now() - startTime;
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
        var tmp = callback;
        callback = event => {
            if(this.process) {
                this.process.send(event);
            }
            else {
                tmp(event);
            }
        };

        return AppEventQueue.subscribe(eventType, this.nodeId, callback, operators);
    }

    unsubscribe<TT extends BaseEvent<any>>(eventType?: TypeOfBaseEvent<TT>) {
        return AppEventQueue.unsubscribe(this.nodeId, eventType);
    }
    
    notify(event: BaseEvent<any>, disableCrossProcess: boolean = false) {
        event.senderId = this.nodeId;
        AppEventQueue.notify(event, false, VirtualNodeService.pid && !disableCrossProcess);
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

export class State {
    date: number;
    activation: Activation = new Activation();
    inputActivations: { [key: string]: Activation } = {}; //nodeId => Activation
    activationErrors: { [key: string]: ActivationError } = {};
}

export class LearningError {
    totalBias: number = 0; 
    total: number[] = [];
    trainingCount: number = 0;
}