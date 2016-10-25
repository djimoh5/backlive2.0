import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';

import { Common } from '../../app//utility/common';

export class BaseNode {
    objectId: string;
    constructor() {
        this.objectId = Common.uniqueId();
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, callback: BaseEventCallback<T>) {
        AppEventQueue.subscribe(eventType, this.objectId, callback);
    }
    
    notify(event: BaseEvent<any>) {
        AppEventQueue.notify(event);
    }
}