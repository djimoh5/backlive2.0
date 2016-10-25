import { Component, OnDestroy } from '@angular/core';
import { AppService, RouteParamsCallback } from 'backlive/service';
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from 'backlive/network/event';

@Component({ template: `` })
export class BaseComponent implements OnDestroy  {
    appService: AppService;
    componentId: number;
    
    static nextComponentId: number = 0;
    
    private componentStartTime: number;
    
    constructor (appService: AppService) {
        this.appService = appService;

        if (this.appService) {
            this.appService.setComponentLoaded();
        }

        this.componentId = ++BaseComponent.nextComponentId;
    }
    
    subscribeEvent<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, callback: BaseEventCallback<T>) {
        this.appService.subscribe(eventType, this.componentId, callback);
    }

    subscribeParams(callback: RouteParamsCallback) {
        this.appService.subscribeToParams(this.componentId, callback);
    }
    
    startTimer() {
        this.componentStartTime = (new Date).getTime();
    }
    
    endTimer(): number {
        return (new Date).getTime() - this.componentStartTime;
    }
    
    ngOnDestroy () {
        if(this.appService) {
            this.appService.unsubscribe(this.componentId);
            this.appService.unsubscribeToParams(this.componentId);
        }
    }
}