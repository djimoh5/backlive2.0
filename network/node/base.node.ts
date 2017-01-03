import { QueueOperators } from '../event/event-queue'
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent, BackpropagateEvent, TrainingDataEvent } from '../event/app.event';

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

            this.unsubscribe(BackpropagateEvent);
            this.subscribe(BackpropagateEvent, 
                event => { this.backpropagate(event); }, 
                { filter: (event, index) => { return this.outputNodes[event.senderId] ? true : false; } }
            );
        }
        else {
            setTimeout(() => { //have to run on next turn or onUpdateInputs won't be set yet
                if(this.onUpdateInputs) {
                    this.onUpdateInputs(this.inputNodes);
                }
            });
        }
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
        var clone = new Node(node.ntype);
        clone._id = node._id;
        this.outputNodes[node._id] = clone;
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
        }

        this.node.activation = event.data;
        this.notify(event);
        console.log('node', this.node._id, 'activated', event.data);

        for(var key in this.inputNodes) { //clear out your input activations
            this.inputNodes[key].activation = null;
        }
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
            var activation: number = 0;
            var count: number = 0;

            for(var key in this.node.activation) {
                var val = this.node.activation[key];
                activation += val;
                sigDeriv +=  val * (1 - val);
                count++;
            }

            delta *= sigDeriv / count;
            activation = activation / count;

            var weights: { [key: string]: number } = {};
            this.node.weights.forEach((w, index) => {
                weights[this.node.inputs[index]] = w;

                //update weight
                //this.node.weights[index] = w - (.2 * delta * activation)//.2 learning rate
            });

            this.notify(new BackpropagateEvent({ error: delta, weights: weights }));
            console.log('backpropagating node ', this.node._id, { error: delta, weights: weights });

            for(var key in this.outputNodes) { //clear out your output backpropagate errors
                this.outputNodes[key].activationError = null;
            }
        }
    }

    private initializeWeights() {
        var len = this.node.inputs.length;
        var weight = Common.round(1 / len, 4);
        this.node.weights = [];

        while(len-- > 0) {
            this.node.weights.push(weight);
        }
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

