import { Component } from '@angular/core';
import { BaseComponent } from './base.component';

import { AnimationType } from 'backlive/directive';

import { AppService } from 'backlive/service';
import { SlidingNavVisibleEvent, PageLoadingEvent } from 'backlive/event';

@Component({ template: `` })
export class PageComponent extends BaseComponent {
    pageAnimation: string;
    defaultAnimation: string;
    loading: boolean;

    constructor (appService: AppService, autoAnimateIn: boolean = true, defaultAnimation: string = AnimationType.FadeIn) {
        super(appService)

        this.service().notify(new SlidingNavVisibleEvent(false));
        
        this.defaultAnimation = defaultAnimation;
        
        if(autoAnimateIn) {
            this.showPage();
        }
        else {
            this.pageAnimation = AnimationType.Hide;
            this.service().notify(new PageLoadingEvent(true));
            this.loading = true;
        }   
    }

    hidePage() {
        this.pageAnimation = AnimationType.Hide;
        this.service().notify(new PageLoadingEvent(true));
    }

    showPage() {
        this.pageAnimation = this.defaultAnimation;
        if(this.loading) {
            this.service().notify(new PageLoadingEvent(false));
        }
    }
    
    service() {
        return this.appService;
    }
}