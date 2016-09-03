import {EventQueue} from './event-queue';
import {BaseEvent} from './app-event';

export class AppEventQueue extends EventQueue {
    private static eventQueue: AppEventQueue;
    
    constructor() {
        super();
    }
    
    static global() {
        AppEventQueue.eventQueue = new AppEventQueue();
    }
    
    static subscribe(eventType: typeof BaseEvent, subscriberId: string, callback: Function) {
        AppEventQueue.eventQueue.subscribe(eventType, subscriberId, callback);
    }
    
    static notify(event: BaseEvent) {
        AppEventQueue.eventQueue.notify(event);
    }
}