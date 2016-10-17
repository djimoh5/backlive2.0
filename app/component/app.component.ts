import {Component, ViewEncapsulation, ElementRef, Attribute} from '@angular/core';

import {Path} from 'backlive/config';
import {Route} from 'backlive/routes';

/* services */
import {AppService, PopupAlert, RouterService, ApiService, UserService} from 'backlive/service';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';
import {HeaderNavComponent, SlidingNavComponent, FooterNavComponent} from 'backlive/component/navigation';

/* models */
import {AppEvent, User} from 'backlive/service/model';

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
        this.routerService = routerService;
        
        userService.getUser().then(user => this.init(user));
        
        this.subscribeEvent(AppEvent.SlidingNavVisible, (visible: boolean) => this.isSlidingNavVisible = visible);
        this.subscribeEvent(AppEvent.PageLoading, (loading: boolean) => this.isPageLoading = loading);
        this.subscribeEvent(AppEvent.RouterLoading, (loading: boolean) => this.isRouterLoading = loading);
    }
    
    init(user: User) {
        console.log(user);
    }
}