import {AppEvent} from './lib/events/app-event';
import {AppEventQueue} from './lib/events/app-event-queue';

import {Common} from '../app//utility/common';

export class BaseNode {
    objectId: string;
    constructor() {
        this.objectId = Common.uniqueId();
    }
    
    subscribe(eventType: typeof AppEvent, callback: Function) {
        AppEventQueue.subscribe(eventType, this.objectId, callback);
    }
    
    notify(event: AppEvent) {
        AppEventQueue.notify(event);
    }
}