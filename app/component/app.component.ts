import {Component, bind, ViewEncapsulation, ElementRef, Attribute} from '@angular/core';
import {RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {HTTP_PROVIDERS} from '@angular/http';

import {Path} from 'backlive/config';
import {Route} from 'backlive/routes';

/* services */
import {AppService, PopupAlert, RouterService, AuthRouterOutlet, ApiService, UserService} from 'backlive/service';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';
import {HeaderNavComponent, SlidingNavComponent, FooterNavComponent} from 'backlive/component/navigation';

/* models */
import {AppEvent, User} from 'backlive/service/model';

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.component.html'),
    directives: [ROUTER_DIRECTIVES, AuthRouterOutlet, HeaderNavComponent, SlidingNavComponent, FooterNavComponent, ModalComponent]
})
@RouteConfig(RouterService.AppRoutes(Route))
export class AppComponent extends BaseComponent {
    userService: UserService;
    routerService: RouterService;
    isSlidingNavVisible: boolean;
    isPageLoading: boolean;

    constructor(routerService: RouterService, appService: AppService, userService: UserService) {
        super(appService);
        this.appService = appService;
        this.userService = userService;
        this.routerService = routerService;
        
        RouterService.enabled = true;
        userService.getUser().then(user => this.initRoute(user));
        
        this.subscribeEvent(AppEvent.SlidingNavVisible, (visible: boolean) => this.isSlidingNavVisible = visible);
        this.subscribeEvent(AppEvent.PageLoading, (loading: boolean) => this.isPageLoading = loading);
    }
    
    initRoute(user: User) {
        console.log(user);
        //RouterService.enableRouting();
    }
}