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
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, callback: BaseEventCallback<T>, operators?: QueueOperators) {
        return AppEventQueue.subscribe(eventType, this.nodeId, callback);
    }
    
    notify(event: BaseEvent<any>) {
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