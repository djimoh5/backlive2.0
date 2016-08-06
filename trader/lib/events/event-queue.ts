import {AppEvent} from './app-event';
import {Common} from 'backlive/utility';
    
export class EventQueue {
    protected events: { [key: string]: { [key: string]: Function[] } };
    
    constructor() {
    }
    
    subscribe(eventType: AppEvent, subscriberId: number | string, callback: Function, filter?: {}) {
        var eventName = eventType.name;
         
        if (!this.events[eventName]) {
            this.events[eventName] = {};
        }
        
        if(!this.events[eventName][subscriberId]) {
            this.events[eventName][subscriberId] = [];
        }

        this.events[eventName][subscriberId].push(callback);
    }
    
    unsubscribe(subscriberId: any, eventName?: string) {
        if(eventName && this.events[eventName] && this.events[eventName][subscriberId]) {
            delete this.events[eventName][subscriberId];
        }
        else {
            for(var name in this.events) {
                if(this.events[name][subscriberId]) {
                    delete this.events[name][subscriberId];
                }
            }
        }
    }

    notify(event: AppEvent) {
        var eventName = event.name;

        if (this.events[eventName]) {
            setTimeout(() => {
                var cnt = 0;
                
                for(var subscriberId in this.events[eventName]) {
                    this.events[eventName][subscriberId].forEach((callback: Function) => {
                        callback(event); 
                    });
                    cnt++;
                }
                
                if(cnt == 0) {
                    Common.log('EVENT: ' + eventName + ' has no subscribers');
                }
                else {
                    Common.log('EVENT: ' + eventName + ' fired to ' + cnt + ' subscribers with data', event);
                }
            });
        }
        else {
            Common.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }
    
    clearEvent(eventName: string) {
        if (this.events[eventName]) {
            delete this.events[eventName];
        }
    }
}