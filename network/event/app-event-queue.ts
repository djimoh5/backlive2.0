import { EventQueue } from './event-queue';
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from './base.event';

export class AppEventQueue {
    private static eventQueue: EventQueue;
    
    static global() {
        AppEventQueue.eventQueue = new EventQueue();

        process.on('message', (event: BaseEvent<any>) => {
            console.log('network - from parent process', event);
            AppEventQueue.notify(event);
        });
    }
    
    static subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, subscriberId: string, callback: BaseEventCallback<T>) {
        AppEventQueue.eventQueue.subscribe(eventType, subscriberId, callback);
    }
    
    static notify(event: BaseEvent<any>) {
        AppEventQueue.eventQueue.notify(event);

        //if(event.isServer) {
            process.send(event);
        //}
    }
}