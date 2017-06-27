import { QueueOperators } from '../event/event-queue';
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';
import { ISession } from '../../core/lib/session';

import { NodeService } from '../../core/service/node.service';
import { VirtualNodeService } from './basic/virtual-node.service';

import { Node, Activation, ActivationError } from '../../core/service/model/node.model';

import { Stats } from '../lib/stats';

import { Network } from '../network';
import { ProcessWrapper } from '../process-wrapper';

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    protected node: T;
    protected outputs: string[] = [];

    state: State;
    pastState: { [key: string]: State };
    learningError: LearningError;
    preserveState: boolean;

    totalCost: number = 0;
    trainingCount = 0;

    layerIndex: number = 0;
    numNodes: number = 1; //for layers, this number will be > 1
    
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
            });

            this.unsubscribe(UpdateNodeWeightsEvent);
            this.subscribe(UpdateNodeWeightsEvent, event => this.updateWeights(event.data));
        }
        else {
            setImmediate(() => { //have to run on next turn or onUpdateInputs won't be set yet
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
            event => this.receiveActivation(event), 
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

    private receiveActivation(event: ActivateNodeEvent) {
        var t = Date.now() - event.created;
        Network.timings.event += t;
        //console.log(event.senderId, event.created, Date.now());
        //console.log(this.node.name, this.node._id, t, ' - ', Network.timings.event);

        this.state.date = event.date;
        this.state.inputActivations[event.senderId] = event.data;
        delete this.pastState[event.date];
        
        this.receive(event);       
    }

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

            for(var i = 0, id: string; id = this.node.inputs[i]; i++) {
                var inActivation = this.state.inputActivations[id].input;
                this.activateMatrix(activation, inActivation, useLinear);
            }

            this.learningError.trainingCount += activation.input.length;

            activation.output = this.state.inputActivations[this.node.inputs[0]].output;
            activation.keys = this.state.inputActivations[this.node.inputs[0]].keys;
            event = new ActivateNodeEvent(activation, this.state.date);
        }

        this.persistActivation(event);
        Network.timings.activation += Date.now() - startTime;
        this.notify(event);
        //console.log('node', this.node.name, 'activated');
    }

    activateMatrix(activation: Activation, inActivation: number[][], useLinear: boolean) {
        for(var row = 0, input: number[]; input = inActivation[row]; row++) {
            var actInput: number[] = [];

            for(var nIndex = 0, weights: number[]; weights = this.node.weights[nIndex]; nIndex++) { //loop through each node in layer
                var actTotal = 0;

                for(var featIndex = 0, len = input.length; featIndex < len; featIndex++) {
                    actTotal += input[featIndex] * weights[featIndex];
                }

                actInput[nIndex] = useLinear ? actTotal : this.sigmoid(actTotal + this.node.bias[nIndex]);
            }

            activation.input[row] = actInput;
        }
    }

    persistActivation(event: ActivateNodeEvent) {
        this.state.activation = event.data;
        this.pastState[event.date] = this.state;
        this.state = new State();
    }

    protected backpropagate(event: BackpropagateEvent) {
        Network.timings.bevent += Date.now() - event.created;
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

            for(var id in state.activationErrors) {
                this.backpropagateMatrix(state, delta, state.activationErrors[id]);
            }
        }
        else {
            //means output node called backpropagate to itself
            delta = event.data.error;
        }

        if(!this.preserveState) {
            delete this.pastState[event.date];
        }

        Network.timings.backpropagation += Date.now() - startTime;
        this.notify(new BackpropagateEvent({ error: delta, weights: this.node.weights }, event.date));
        //console.log('backpropagating node ', this.node.name, VirtualNodeService.pid);
    }

    backpropagateMatrix(state: State, delta: Activation, activationError: ActivationError) {
        var inputError = activationError.error.input;

        for(var row = 0, input: number[]; input = state.activation.input[row]; row++) { //loop through each input
            var delatInput: number[] = [];
            var inputErrorRow = inputError[row];

            for(var featIndex = 0, len = input.length; featIndex < len; featIndex++) { //loop through each feature (node)
                var feature = input[featIndex];
                var sigPrime = feature * (1 - feature);
                var deltaTotal = 0;

                for(var outputIndex = 0, len = inputErrorRow.length; outputIndex < len; outputIndex++) { //loop through each output error node
                    deltaTotal += inputErrorRow[outputIndex] * activationError.weights[outputIndex][featIndex] * sigPrime;
                }

                delatInput[featIndex] = deltaTotal;
                this.calculateWeightError(state, row, featIndex, deltaTotal);
            }

            delta.input[row] = delatInput;
        }
    }

    calculateWeightError(state: State, row: number, featIndex: number, featDelta: number) {
        var nodeLearningError = this.learningError.total[featIndex];
        this.learningError.totalBias[featIndex] += featDelta;

        for(var i = 0, id: string; id = this.node.inputs[i]; i++) {
            var input = state.inputActivations[id].input[row];

            for(var wIndex = 0, len = input.length; wIndex < len; wIndex++) {
                nodeLearningError[wIndex] += featDelta * input[wIndex];
            }
        }; 
    }

    private initializeWeights() {
        var len = this.node.inputs.length;

        if(len === 1 && this.state.inputActivations[this.node.inputs[0]].input[0].length > 1) {
            len = this.state.inputActivations[this.node.inputs[0]].input[0].length;
        }

        if(len > 1) {
            this.node.bias = [];
            this.node.weights = [];

            for(var i = 0; i < this.numNodes; i++) {
                this.node.bias[i] = Stats.randomNormalDist(0, 1);
                this.node.weights[i] = [];
                var wIndex = 0;

                while(wIndex < len) {
                    var weight: number = Stats.randomNormalDist(0, 1 / Math.sqrt(len));
                    this.node.weights[i][wIndex++] = weight;
                }

                this.resetError();
            }
        }
    }

    updateWeights(learningRate: number) {
        var startTime = Date.now();

        if(this.node.weights) {
            for(var nIndex = 0, weights: number[]; weights = this.node.weights[nIndex]; nIndex++) {
                for(var wIndex = 0, len = weights.length; wIndex < len; wIndex++) {
                    weights[wIndex] = weights[wIndex] - (learningRate * this.learningError.total[nIndex][wIndex] / this.learningError.trainingCount);
                }

                this.node.bias[nIndex] = this.node.bias[nIndex] - (learningRate * this.learningError.totalBias[nIndex] / this.learningError.trainingCount);
            }
            
            this.resetError();

            //console.log(this.node._id, 'weights:', this.node.weights, 'bias:', this.node.bias);
        }

         Network.timings.updateWeight += Date.now() - startTime;
    }

    private resetError() {
        var startTime = Date.now();
        
        this.learningError = new LearningError();

        for(var nIndex = 0, weights: number[]; weights = this.node.weights[nIndex]; nIndex++) {
            this.learningError.totalBias[nIndex] = 0;
            this.learningError.total[nIndex] = [];

            for(var i = 0, len = weights.length; i < len; i++) {
                this.learningError.total[nIndex][i] = 0;
            }
        }

        this.learningError.trainingCount = 0;

        Network.timings.resetError += Date.now() - startTime;
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
    totalBias: number[] = []; 
    total: number[][] = [];
    trainingCount: number = 0;
}