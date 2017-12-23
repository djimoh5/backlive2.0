import { Component } from '@angular/core';



/* components */
import { BaseComponent } from 'backlive/component/shared';

/* services */
import { AppService, UserService } from 'backlive/service';

/* models */
import { User } from 'backlive/service/model';
import { SlidingNavVisibleEvent, PageLoadingEvent, RouterLoadingEvent } from 'backlive/event';

@Component({
    selector: 'backlive-app',
    templateUrl: 'app.component.html'
})
export class AppComponent extends BaseComponent {
    userService: UserService;
    isSlidingNavVisible: boolean;
    isPageLoading: boolean;
    isRouterLoading: boolean;

    constructor(appService: AppService, userService: UserService) {
        super(appService);
        this.appService = appService;
        this.userService = userService;
        
        userService.getUser().then(user => this.init(user));
        
        this.subscribeEvent(SlidingNavVisibleEvent, event => {
             this.isSlidingNavVisible = event.data;
        });
        this.subscribeEvent(PageLoadingEvent, event => { this.isPageLoading = event.data; });
        this.subscribeEvent(RouterLoadingEvent, event => { this.isRouterLoading = event.data; });
    }
    
    init(_user: User) {
        
    }
}