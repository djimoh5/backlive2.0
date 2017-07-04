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

var aoA = require('../add-ons/build/Release/activate');

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

            var activation = new Activation([this.state.inputActivations[this.node.inputs[0]].rows(), this.numNodes]);

            for(var i = 0, id: string; id = this.node.inputs[i]; i++) {
                this.activateMatrix(activation, this.state.inputActivations[id], useLinear);
            }

            this.learningError.trainingCount += activation.rows();

            activation.output = this.state.inputActivations[this.node.inputs[0]].output;
            activation.keys = this.state.inputActivations[this.node.inputs[0]].keys;
            event = new ActivateNodeEvent(activation, this.state.date);
        }

        this.persistActivation(event);
        Network.timings.activation += Date.now() - startTime;
        this.notify(event);
        //console.log('node', this.node.name, 'activated');
    }

    activateMatrix(activation: Activation, inActivation: Activation, useLinear: boolean) {
        aoA.activate(Buffer.from(activation.data().buffer), inActivation.data(), this.node.weights, this.node.bias, inActivation.rows());
        /*var featLen = inActivation.columns();

        for(var row = 0, len = inActivation.rows(); row < len; row++) {
            for(var nIndex = 0; nIndex < this.numNodes; nIndex++) { //loop through each node in layer
                var actTotal = 0;

                for(var featIndex = 0; featIndex < featLen; featIndex++) {
                    actTotal += inActivation.get(row, featIndex) * this.node.weights[nIndex*featLen + featIndex];
                }

                activation.set(row, nIndex, useLinear ? actTotal : this.sigmoid(actTotal + this.node.bias[nIndex]));
            }
        }*/
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
        var delta: Activation;

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

            delta = new Activation([state.activation.rows(), state.activation.columns()]);

            for(var id in state.activationErrors) {
                this.backpropagateMatrix(delta, state, state.activationErrors[id]);
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

    backpropagateMatrix(delta: Activation, state: State, activationError: ActivationError) {
        aoA.backpropagate(Buffer.from(delta.data().buffer), state.activation, activationError.error, activationError.weights,
            state.activation.rows(), Buffer.from(this.learningError.total.buffer), Buffer.from(this.learningError.totalBias.buffer),
            state.inputActivations[this.node.inputs[0]].data());
        /*var outputError = activationError.error;
        var featLen = state.activation.columns();
        var outputLen = outputError.columns();

        for(var row = 0, len = state.activation.rows(); row < len; row++) { //loop through each input
            for(var featIndex = 0; featIndex < featLen; featIndex++) { //loop through each feature (node)
                var feature = state.activation.get(row, featIndex);
                var sigPrime = feature * (1 - feature);
                var deltaTotal = 0;

                for(var oIndex = 0; oIndex < outputLen; oIndex++) { //loop through each output error node
                    deltaTotal += outputError.get(row, oIndex) * activationError.weights[oIndex*featLen + featIndex] * sigPrime;
                }

                delta.set(row, featIndex, deltaTotal);
                this.calculateWeightError(state, row, featIndex, deltaTotal);
            }
        }*/
    }

    /*calculateWeightError(state: State, row: number, featIndex: number, featDelta: number) {
        this.learningError.totalBias[featIndex] += featDelta;

        for(var i = 0, id: string; id = this.node.inputs[i]; i++) {
            var inActivation = state.inputActivations[id];

            for(var wIndex = 0, weightLen = inActivation.columns(); wIndex < weightLen; wIndex++) {
                this.learningError.total[featIndex*weightLen + wIndex] += featDelta * inActivation.get(row, wIndex);
            }
        }; 
    }*/

    private initializeWeights() {
        var len = this.node.inputs.length;

        if(len === 1 && this.state.inputActivations[this.node.inputs[0]].columns() > 1) {
            len = this.state.inputActivations[this.node.inputs[0]].columns();
        }

        if(len > 1) {
            this.node.bias = new Float32Array(this.numNodes);
            this.node.weights = new Float32Array(this.numNodes * len);

            for(var i = 0; i < this.numNodes; i++) {
                this.node.bias[i] = Stats.randomNormalDist(0, 1);

                var wIndex = 0;
                while(wIndex < len) {
                    this.node.weights[i*len + wIndex++] = Stats.randomNormalDist(0, 1 / Math.sqrt(len));
                }

                this.resetError();
            }
        }
    }

    updateWeights(learningRate: number) {
        var startTime = Date.now();

        if(this.node.weights) {
            /*var wlen = this.node.weights.length / this.numNodes;
            aoA.updateWeights(learningRate, this.learningError.trainingCount, this.numNodes, wlen, Buffer.from(this.node.weights.buffer), 
                Buffer.from(this.node.bias.buffer), Buffer.from(this.learningError.total.buffer), Buffer.from(this.learningError.totalBias.buffer));
            this.resetError();*/

            var wlen = this.node.weights.length / this.numNodes;

            for(var nIndex = 0; nIndex < this.numNodes; nIndex++) {
                for(var wIndex = 0; wIndex < wlen; wIndex++) {
                    this.node.weights[nIndex*wlen + wIndex] = this.node.weights[nIndex*wlen + wIndex] - (learningRate * this.learningError.get(nIndex, wIndex) / this.learningError.trainingCount);
                }

                this.node.bias[nIndex] -= learningRate * this.learningError.totalBias[nIndex] / this.learningError.trainingCount;
            }
            
            this.resetError();

            //console.log(this.node._id, 'weights:', this.node.weights, 'bias:', this.node.bias);
        }

        Network.timings.updateWeight += Date.now() - startTime;
    }

    private resetError() {
        var startTime = Date.now();
        this.learningError = new LearningError([this.numNodes, this.node.weights.length / this.numNodes]);
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
    activation: Activation;
    inputActivations: { [key: string]: Activation } = {}; //nodeId => Activation
    activationErrors: { [key: string]: ActivationError } = {};
}

export class LearningError {
    total: Float32Array; //[][];
    totalBias: Float32Array; //[]; 
    trainingCount: number = 0;

    constructor(private dimensions: [number, number]) {
        this.total = new Float32Array(dimensions[0] * dimensions[1]);
        this.totalBias = new Float32Array(dimensions[0]);
    }

    get(row: number, col: number) {
        return this.total[row*this.dimensions[1] + col];
    }
}