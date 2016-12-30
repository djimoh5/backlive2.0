import { QueueOperators } from '../event/event-queue'
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';
import { ISession } from '../../core/lib/session';

import { NodeService } from '../../core/service/node.service';
import { Node, Activation } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

import { Stats } from '../lib/stats';

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    private node: T;
    private inputNodes: { [key: string]: T } = {};
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
        this.nodeService.getInputs(node._id).then(nodes => {
            this.updateInputs(nodes);
        });
    }

    getNode(): T {
        return this.node;
    }

    updateInputs(nodes: T[]) {
        this.inputNodes = {};

        nodes.forEach(n => {
            this.inputNodes[n._id] = n;

            if(!this.subscribedTypes[n.ntype]) {
                this.subscribe(NodeConfig.activationEvent(n.ntype), 
                    event => {
                        this.receive(event);
                    }, 
                    { filter: (event, index) => { return Common.inArray(event.senderId, this.node.inputs); } }
                );
                this.subscribedTypes[n.ntype] = true;
            }
        });

        if(this.onUpdateInputs) {
            this.onUpdateInputs(this.inputNodes);
        }
    }

    onUpdateInputs: (nodes: { [key: string]: T }) => void;

    abstract receive(event: ActivateNodeEvent);

    activate(event?: ActivateNodeEvent, normalize?: Normalize) {
        if(!event) {
            var activation: Activation = {};

            if(!this.node.weights) {
                this.initializeWeights();
            }

            for(var i = 0, len = this.node.inputs.length; i < len; i++) {
                var id = this.node.inputs[i];
                var inActivation = this.inputNodes[id].activation;

                if(!inActivation) {
                    return; //must first have an activation of all inputs to activate yourself
                }

                if(normalize && normalize === Normalize.PercentRank) {
                    inActivation = Stats.percentRank(inActivation);
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

        console.log(event.data);
        this.node.activation = event.data;
        this.notify(event);
    }

    private initializeWeights() {
        var len = this.node.inputs.length;
        var weight = Common.round(1 / len, 4);
        this.node.weights = [];

        while(len-- > 0) {
            this.node.weights.push(weight);
        }
    }

    protected sigmoid(x: number) {
        return 1 / (1 + Math.exp(-x));
    }

    subscribe<TT extends BaseEvent<any>>(eventType: TypeOfBaseEvent<TT>, callback: BaseEventCallback<TT>, operators?: QueueOperators<TT>) {
        return AppEventQueue.subscribe(eventType, this.nodeId, callback, operators);
    }
    
    notify(event: BaseEvent<any>) {
        event.senderId = this.nodeId;
        AppEventQueue.notify(event);
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

