﻿import {Component, bind, ViewEncapsulation, ElementRef, Attribute} from 'angular2/core';
import {Location, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Path} from 'backlive/config';

import {RouteComponentMap} from 'backlive/routes';

/* services */
import {AppService, PopupAlert, RouterService, AuthRouterOutlet, ApiService, UserService} from 'backlive/service';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';
import {HeaderNavComponent, SlidingNavComponent, FooterNavComponent} from 'backlive/component/navigation';

/* models */
import {AppEvent, User} from 'backlive/service/model';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.component.html'),
    directives: [ROUTER_DIRECTIVES, AuthRouterOutlet, HeaderNavComponent, SlidingNavComponent, FooterNavComponent, ModalComponent]
})
@RouteConfig(RouterService.AppRoutes)
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
        
        this.subscribeEvent(AppEvent.Navigate, (route: string[]) => this.navigate(route));
        this.subscribeEvent(AppEvent.Alert, this.showAlert);
        this.subscribeEvent(AppEvent.SlidingNavVisible, (visible: boolean) => this.isSlidingNavVisible = visible);
        this.subscribeEvent(AppEvent.PageLoading, (loading: boolean) => this.isPageLoading = loading);
    }
    
    initRoute(user: User) {
        console.log(user);
        //RouterService.enableRouting();
    }
    
    navigate(route: string[]) {
        this.routerService.navigate(route);
    }
    
    showAlert=(alert: PopupAlert) => { /* this is an example of an alternate way to preserve "this" in callbacks */
        console.log(alert);
    }
}