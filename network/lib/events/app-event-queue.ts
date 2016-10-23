import { EventQueue } from './event-queue';
import { BaseEvent } from './app-event';

export class AppEventQueue {
    private static eventQueue: EventQueue;
    
    constructor() {
    }
    
    static global() {
        AppEventQueue.eventQueue = new EventQueue();
    }
    
    static subscribe(eventType: typeof BaseEvent, subscriberId: string, callback: Function) {
        AppEventQueue.eventQueue.subscribe(eventType, subscriberId, callback);
    }
    
    static notify(event: BaseEvent) {
        AppEventQueue.eventQueue.notify(event);
    }
}