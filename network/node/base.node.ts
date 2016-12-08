import { QueueOperators } from '../event/event-queue'
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';

import { Common } from '../../app//utility/common';

export class BaseNode {
    protected nodeId: string;
    inputs: EventNodeMap;

    constructor() {
        this.nodeId = Common.uniqueId();
        this.inputs = {};
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) {
        var operators: QueueOperators<T>;

        if(this.inputs[eventType.name]) {
            operators = {
                filter: (event, index) => {
                    return typeof this.inputs[eventType.name][event.senderId] !== 'undefined';
                }
            }
        }

        return AppEventQueue.subscribe(eventType, this.nodeId, callback, operators);
    }
    
    notify(event: BaseEvent<any>) {
        event.senderId = this.nodeId;
        AppEventQueue.notify(event);
    }
}

interface InputNode {
    eventName: string;
    nodeId: string;
    weight: number;
}

interface NodeMap {
    [key: string]: InputNode;
}

interface EventNodeMap {
    [key: string]: NodeMap;
}