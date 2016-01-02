import {Component, OnDestroy} from 'angular2/core';
import {AppService} from 'backlive/service';

@Component({})
export class BaseComponent implements OnDestroy  {
    appService: AppService;
    
    constructor (appService: AppService) {
        this.appService = appService;
    }
    
    subscribeEvent (eventName: string, callback: Function) {
        this.appService.subscribe(eventName, this, callback);
    }
    
    ngOnDestroy () {
        this.appService.unsubscribe(this);
    }
}