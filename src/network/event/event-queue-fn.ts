import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from './base.event';

declare var setImmediate; 
if(typeof(setImmediate) === 'undefined') { var setImmediate: any = setTimeout; console.log('setImmediate not defined, using setTimeout'); }

export class EventQueue {
    protected events: { [key: string]: { [key: string]: Activator<BaseEvent<any>>[] } } = {};

    constructor() {
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, subscriberId: number | string, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) {
        var eventName = eventType['eventName'];
        if(!eventName) {
            throw('The event does not have a name. Please remember to annotate your event with @AppEvent.');    
        }

        if (!this.events[eventName]) {
            this.events[eventName] = {};
        }

        if (!this.events[eventName][subscriberId]) {
            this.events[eventName][subscriberId] = [];
        }

        this.events[eventName][subscriberId].push({ fn: callback, filter: operators && operators.filter });

    }
    
    unsubscribe(subscriberId: any, eventType?: typeof BaseEvent) {
        var eventName = eventType.eventName;

        if (eventName) {
            if (this.events[eventName] && this.events[eventName][subscriberId]) {
                delete this.events[eventName][subscriberId];
            }
        }
        else {
            for (var name in this.events) {
                if (this.events[name][subscriberId]) {
                    delete this.events[name][subscriberId];
                }
            }
        }
    }
    
    notify(event: BaseEvent<any>) {
        var eventName = event.eventName;

        if (this.events[eventName]) {
            setImmediate(() => {
                var cnt = 0, scnt = 0;

                for (var subscriberId in this.events[eventName]) {
                    scnt++;
                    this.events[eventName][subscriberId].forEach(activator => {
                        if(!activator.filter || activator.filter(event, 0)) {
                            activator.fn(event);
                            cnt++;
                        }
                    });
                }

                if (cnt == 0) {
                    //console.log('EVENT: ' + eventName + ' has no subscribers');
                }
            });
        }
        else {
            console.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }

    clearEvent(eventName: string) {
        if (this.events[eventName]) {
            delete this.events[eventName];
        }
    }
}

export class QueueOperators<T extends BaseEvent<any>> {
    filter: (value: T, index: number) => boolean;
}

export interface Activator<T extends BaseEvent<any>> {
    fn: BaseEventCallback<T>;
    filter?: (value: T, index: number) => boolean;
}