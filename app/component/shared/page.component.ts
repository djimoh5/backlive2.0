import {Component} from '@angular/core';
import {BaseComponent} from './base.component';

import {AnimateDirective, AnimationType} from 'backlive/directive';

import {AppService} from 'backlive/service';
import {AppEvent} from 'backlive/service/model';

@Component({ template: `` })
export class PageComponent extends BaseComponent {
    pageAnimation: string;
    defaultAnimation: string;
    loading: boolean;
    
    constructor (appService: AppService, autoAnimateIn: boolean = true, defaultAnimation: string = AnimationType.FadeIn) {
        super(appService)

        this.service().notify(AppEvent.SlidingNavVisible, false);
        
        this.defaultAnimation = defaultAnimation;
        
        if(autoAnimateIn) {
            this.showPage();
        }
        else {
            this.pageAnimation = AnimationType.Hide;
            this.service().notify(AppEvent.PageLoading, true);
            this.loading = true;
        }   
    }
    
    showPage() {
        this.pageAnimation = this.defaultAnimation;

        if(this.loading) {
            this.service().notify(AppEvent.PageLoading, false);
        }
    }
    
    service() {
        return this.appService;
    }
}