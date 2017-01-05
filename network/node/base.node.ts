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

    private totalError: number[];
    private errorCount: number;
    
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
                if(this.onUpdateInputs) {
                    this.onUpdateInputs(this.inputNodes);
                }

                if(this.hasOutputs()) {
                    this.unsubscribe(TrainingDataEvent);
                }
            });

            this.unsubscribe(UpdateNodeWeightsEvent);
            this.subscribe(UpdateNodeWeightsEvent, event => this.updateWeights(event.data));
        }
        else {
            setTimeout(() => { //have to run on next turn or onUpdateInputs won't be set yet
                if(this.onUpdateInputs) {
                    this.onUpdateInputs(this.inputNodes);
                }
            });
        }

        //event input nodes (nodes without inputs) need to listen so they can fire we are complete
        this.unsubscribe(BackpropagateEvent);
        this.subscribe(BackpropagateEvent, 
            event => this.backpropagate(event), 
            { filter: (event, index) => { return this.outputNodes[event.senderId] ? true : false; } }
        );
    }

    getNode(): T {
        return this.node;
    }

    private updateInputs(nodes: Node[]) {
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

    protected activate(event?: ActivateNodeEvent) {
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

            for(var k in activation) {
                activation[k] = this.sigmoid(activation[k]);
            }

            event = new ActivateNodeEvent(activation);

            //store total activation for each input, needed later for backpropagation and weighr updating
            this.node.inputs.forEach((id, index) => {
                var totalActivation: number = 0;
                var count: number = 0;

                for(var key in this.inputNodes[id].activation) { //get avg. activation across keys
                    totalActivation += this.inputNodes[id].activation[key];
                    count++;
                }

                this.totalError[index] += totalActivation / count;
                this.inputNodes[id].activation = null; //clear out activation
            });
        }

        this.node.activation = event.data;
        this.errorCount++; //# of training data, used to update weights
        
        this.notify(event);

        console.log('node', this.node._id, 'activated', event);
    }

    protected backpropagate(event: BackpropagateEvent) {
        if(this.node.inputs) {
            var data = event.data;
            var delta = 0;

            if(data.weights) {
                this.outputNodes[event.senderId].activationError = data;
                
                for(var key in this.outputNodes) {
                    data = this.outputNodes[key].activationError;

                    if(!data) {
                        return; //must have backpropagation from all your outputs to backpropagate yourself
                    }

                    delta += data.error * data.weights[this.node._id];
                }
            }
            else {
                delta = data.error;
            }
            
            var sigDeriv: number = 0;
            var count: number = 0;

            for(var key in this.node.activation) { //average sigmoid derivative across keys (these are not inputs!)
                var sig = this.node.activation[key];
                sigDeriv += sig * (1 - sig);
                count++;
            }

            delta *= sigDeriv / count;
            this.errorCount++;

            var weights: { [key: string]: number } = {}; //store your weights so next layer can compute their responsibility
            this.node.weights.forEach((w, index) => {
                weights[this.node.inputs[index]] = w;
                this.totalError[index] = delta * this.totalError[index]; //totalError prev contains total activation
            });

            this.notify(new BackpropagateEvent({ error: delta, weights: weights }));

            for(var key in this.outputNodes) { //clear out your output backpropagate errors
                this.outputNodes[key].activationError = null;
            }

            console.log('backpropagating node ', this.node._id, { error: delta, weights: weights });
        }
        else {
            //no inputs, so must be at input layer
            this.notify(new BackpropagateCompleteEvent(null));
        }
    }

    private initializeWeights() {
        var len = this.node.inputs.length;
        var weight = Common.round(1 / len, 4);
        this.node.weights = [];

        while(len-- > 0) {
            this.node.weights.push(weight);
        }

        this.resetError();
    }

    updateWeights(learningRate: number) {
        this.node.weights.forEach((w, index) => {
            console.log(w, learningRate, this.totalError, this.errorCount);
            this.node.weights[index] = w - (learningRate * this.totalError[index] / this.errorCount);
        });

        this.resetError();

        console.log(this.node._id, 'new weights', this.node.weights);
    }

    private resetError() {
        this.totalError = [];

        this.node.weights.forEach(w => {
            this.totalError.push(0);
        });

        this.errorCount = 0;
    }

    private sigmoid(x: number, derivative: boolean = false) {
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

    hasOutputs() {
        return Common.hasKeys(this.outputNodes);
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

