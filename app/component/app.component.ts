import { Component, ElementRef } from '@angular/core';

import { Path } from 'backlive/config';
import { Route } from 'backlive/routes';

/* components */
import { BaseComponent, ModalComponent } from 'backlive/component/shared';
import { HeaderNavComponent, SlidingNavComponent, FooterNavComponent } from 'backlive/component/navigation';

/* services */
import { AppService, RouterService, ApiService, UserService } from 'backlive/service';

/* models */
import { User } from 'backlive/service/model';
import { SlidingNavVisibleEvent, PageLoadingEvent, RouterLoadingEvent } from 'backlive/event';

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.component.html')
})
export class AppComponent extends BaseComponent {
    userService: UserService;
    routerService: RouterService;
    isSlidingNavVisible: boolean;
    isPageLoading: boolean;
    isRouterLoading: boolean;

    constructor(routerService: RouterService, appService: AppService, userService: UserService) {
        super(appService);
        this.appService = appService;
        this.userService = userService;
        
        userService.getUser().then(user => this.init(user));
        
        this.subscribeEvent(SlidingNavVisibleEvent, event => {
             this.isSlidingNavVisible = event.data;
        });
        this.subscribeEvent(PageLoadingEvent, event => { this.isPageLoading = event.data });
        this.subscribeEvent(RouterLoadingEvent, event => { this.isRouterLoading = event.data });
    }
    
    init(user: User) {
        
    }
}