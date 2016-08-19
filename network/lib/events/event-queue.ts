import {AppEvent} from './app-event';
import {Common} from '../../../app/utility/common';

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
    
export class EventQueue {
    protected events: { [key: string]: Observable<AppEvent> } = {};
    protected activators: { [key: string]: Observer<AppEvent> } = {};
    protected subscribers: { [key: string]: { [key: string]: Subscription[] } } = {};
    
    constructor() {
    }
    
    subscribe(eventType: typeof AppEvent, subscriberId: number | string, callback: Function, filter?: {}) {
        console.log(eventType.eventName, 'subcribed to by ' + subscriberId);
        var eventName = eventType.eventName;
        var observable: Observable<AppEvent>;
        
        if (!this.events[eventName]) {
            this.events[eventName] = observable = Observable.create(observer => {
                this.activators[eventName] = observer;
            });
            
            this.subscribers[eventName] = {};
        }
        else {
            observable = this.events[eventName];
        }
        
        if (!this.subscribers[eventName][subscriberId]) {
            this.subscribers[eventName][subscriberId] = [];
        }
        
        this.subscribers[eventName][subscriberId].push(observable.subscribe((event: AppEvent) => {
            callback(event);
        }));
    }
    
    unsubscribe(subscriberId: any, eventName?: string) {
        if(eventName && this.subscribers[eventName] && this.subscribers[eventName][subscriberId]) {
            this.unsubscribeObservable(subscriberId, eventName);
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

    notify(event: AppEvent) {
        var eventName = event.eventName;
        
        if (this.activators[eventName]) {
            setTimeout(() => {
                Common.log('EVENT: ' + eventName + ' fired');// with data', event.data);
                this.activators[eventName].next(event);
            });
        }
        else {
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