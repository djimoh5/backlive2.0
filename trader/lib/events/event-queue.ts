import {TraderEvent} from './trader-event';
import {Common} from 'backlive/utility';
    
export class EventQueue {
    private events: { [key: string]: { [key: string]: Function[] } };
    
    subscribe(event: TraderEvent, subscriberId: string | number, callback: Function) {
        var eventName = event.name;
         
        if (!this.events[eventName]) {
            this.events[eventName] = {};
        }
        
        if(!this.events[eventName][subscriberId]) {
            this.events[eventName][subscriberId] = [];
        }

        this.events[eventName][subscriberId].push(callback);
    }
    
    unsubscribe(componentId: any, eventName?: string) {
        if(eventName && this.events[eventName] && this.events[eventName][componentId]) {
            delete this.events[eventName][componentId];
        }
        else {
            for(var name in this.events) {
                if(this.events[name][componentId]) {
                    delete this.events[name][componentId];
                }
            }
        }
    }

    notify<T>(eventName: string, data: T = null) {
        if (this.events[eventName]) {
            setTimeout(() => {
                var cnt = 0;
                
                for(var subscriberId in this.events[eventName]) {
                    this.notifySubscriber<T>(subscriberId, eventName, data);
                    cnt++;
                }
                
                if(cnt == 0) {
                    Common.log('EVENT: ' + eventName + ' has no subscribers');
                }
                else {
                    Common.log('EVENT: ' + eventName + ' fired to ' + cnt + ' subscribers with data', data);
                }
            });
        }
        else {
            Common.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }
    
    private notifySubscriber<T>(subscriberId: string | number, eventName: string, data: T = null) {
        this.events[eventName][subscriberId].forEach((callback: Function) => {
            callback(data); 
        });
    }
    
    clearEvent(eventName: string) {
        if (this.events[eventName]) {
            delete this.events[eventName];
        }
    }
}