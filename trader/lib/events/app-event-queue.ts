import {EventQueue} from './event-queue';
import {TraderEvent} from './trader-event';

export class AppEventQueue extends EventQueue {
    private static eventQueue: AppEventQueue;
    
    constructor() {
        super();
    }
    
    static global() {
        AppEventQueue.eventQueue = new AppEventQueue();
    }
    
    static subscribe(obj: any, event: TraderEvent, callback: Function) {
        AppEventQueue.eventQueue.subscribe(obj, event, callback);
    }
    
    static notify(event: TraderEvent) {
        AppEventQueue.eventQueue.notify(event);
    }
}