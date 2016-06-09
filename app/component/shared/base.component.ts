import {Component, OnDestroy} from '@angular/core';
import {AppService} from 'backlive/service';

@Component({ template: `` })
export class BaseComponent implements OnDestroy  {
    appService: AppService;
    componentId: number;
    
    static nextComponentId: number = 0;
    
    constructor (appService: AppService) {
        this.appService = appService;
        this.componentId = ++BaseComponent.nextComponentId;
    }
    
    subscribeEvent (eventName: string, callback: Function) {
        this.appService.subscribe(eventName, this.componentId, callback);
    }
    
    ngOnDestroy () {
        if(this.appService) {
            this.appService.unsubscribe(this.componentId);
        }
    }
}