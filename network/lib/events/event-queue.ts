import {BaseEvent} from './app-event';
import {Common} from '../../../app/utility/common';

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

declare var io;
 
export class EventQueue {
    protected events: { [key: string]: Observable<BaseEvent> } = {};
    protected activators: { [key: string]: Subject<BaseEvent> } = {};
    protected subscribers: { [key: string]: { [key: string]: Subscription[] } } = {};

    constructor() {
    }
    
    subscribe(eventType: typeof BaseEvent, subscriberId: number | string, callback: Function, filter?: {}) {
        if(!eventType.eventName) {
            throw('The event does not have a name. Please remember to annotate your event with @AppEvent.');    
        }
        
        console.log(eventType.eventName, 'subscribed to by ' + subscriberId);
        var eventName = eventType.eventName;
        var observable: Observable<BaseEvent>;
        
        if (!this.events[eventName]) {
            this.events[eventName] = observable = Observable.create(observer => {
                if(!this.activators[eventName]) {
                    this.activators[eventName] = new Subject<BaseEvent>();
                }
                
                this.activators[eventName].subscribe(observer);
            });
            
            this.subscribers[eventName] = {};
        }
        else {
            observable = this.events[eventName];
        }
        
        if (!this.subscribers[eventName][subscriberId]) {
            this.subscribers[eventName][subscriberId] = [];
        }
        
        this.subscribers[eventName][subscriberId].push(observable.subscribe((event: BaseEvent) => {
            callback(event);
        }));
    }
    
    unsubscribe(subscriberId: any, eventType?: typeof BaseEvent) {
        if(eventType && this.subscribers[eventType.name] && this.subscribers[eventType.name][subscriberId]) {
            this.unsubscribeObservable(subscriberId, eventType.name);
        }
        else {
            for(var name in this.subscribers) {
                if(this.subscribers[name][subscriberId]) {
                    this.unsubscribeObservable(subscriberId, name);
                }
            }
        }
    }
    
    private unsubscribeObservable(subscriberId: any, eventName: string) {
        this.subscribers[eventName][subscriberId].forEach(subscription => {
            subscription.unsubscribe();    
        });
        
        delete this.subscribers[eventName][subscriberId];
    }

    notify(event: BaseEvent) {
        var eventName = event.eventName;

        if (this.activators[eventName]) {
            setTimeout(() => {
                //Common.log('EVENT: ' + eventName + ' fired');// with data', event.data);
                this.activators[eventName].next(event);
            });
        }
        else if(!event.isServer) {
            Common.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }
    
    clearEvent(eventName: string) {
        if (this.events[eventName]) {
            delete this.events[eventName];
            for(var name in this.activators) {
                this.activators[name].complete();
            }
            
            for(var name in this.subscribers) {
                for(var subscriberId in this.subscribers[name]) {
                    this.subscribers[name][subscriberId].forEach(subscriber => {
                       subscriber.unsubscribe(); 
                    });
                }
            }
        }
    }
}