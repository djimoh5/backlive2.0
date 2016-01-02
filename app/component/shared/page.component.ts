import {Component} from 'angular2/core';
import {BaseComponent} from './base.component';
import {AppService} from 'backlive/service';

import {Event} from '../../service/model/event';

import {Animation} from 'backlive/utility';

@Component({
    directives: []
})
export class PageComponent extends BaseComponent {
    pageAnimation: string;
    animationType: string = Animation.Rotate3d;
    
    constructor (appService: AppService, autoAnimateIn: boolean = true, defaultAnimation: string = Animation.FadeIn) {
        super(appService)

        this.service().notify(Event.SlidingNavVisible, false);
        
        this.animationType = defaultAnimation;
        this.pageAnimation = Animation.hide(this.animationType);
        
        if(autoAnimateIn) {
            this.show();
        }
        else {
            this.service().notify(Event.PageLoading, true);
        }
    }
    
    show() {
        setTimeout(() => {
            this.pageAnimation = this.animationType;
            this.service().notify(Event.PageLoading, false);
        });
    }
    
    service() {
        return this.appService;
    }
}