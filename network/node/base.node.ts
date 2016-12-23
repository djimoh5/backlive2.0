import { QueueOperators } from '../event/event-queue'
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';

import { Node, Activation } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    private node: Node;

    constructor(node: Node) {
        this.nodeId = Common.uniqueId();
        
        if(node) {
            node.inputs.forEach(n => {
                this.subscribe(NodeConfig.activationEvent(node.ntype), event => {
                    this.receive(event);
                });
            });
        }
    }

    abstract receive(event: ActivateNodeEvent);

    activate(event: ActivateNodeEvent) {
        this.notify(event);
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) {
        var operators: QueueOperators<T>;

        if(this.node && this.node.inputs.length > 0) {
            operators = {
                filter: (event, index) => {
                    return Common.inArray(event.senderId, this.node.inputs);
                }
            }
        }

        return AppEventQueue.subscribe(eventType, this.nodeId, callback, operators);
    }
    
    notify(event: BaseEvent<any>) {
        event.senderId = this.node._id;
        AppEventQueue.notify(event);
    }

    setModel(model: T) {
        this.node = model;
    }

    getModel(): T | Node {
        return this.node;
    }
}