import {Component, OnDestroy} from '@angular/core';
import {AppService} from 'backlive/service';

@Component({ template: `` })
export class BaseComponent implements OnDestroy  {
    appService: AppService;
    componentId: number;
    
    static nextComponentId: number = 0;
    
    private componentStartTime: number;
    
    constructor (appService: AppService) {
        this.appService = appService;
        this.componentId = ++BaseComponent.nextComponentId;
    }
    
    subscribeEvent(eventName: string, callback: Function) {
        this.appService.subscribe(eventName, this.componentId, callback);
    }

    subscribeParams(callback: Function) {
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