import {Component, bind, ViewEncapsulation, ElementRef, Attribute} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {HTTP_PROVIDERS} from '@angular/http';

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
    templateUrl: Path.Component('app.component.html'),
    directives: [ROUTER_DIRECTIVES, HeaderNavComponent, SlidingNavComponent, FooterNavComponent, ModalComponent]
})
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
        
        userService.getUser().then(user => this.init(user));
        
        this.subscribeEvent(AppEvent.SlidingNavVisible, (visible: boolean) => this.isSlidingNavVisible = visible);
        this.subscribeEvent(AppEvent.PageLoading, (loading: boolean) => this.isPageLoading = loading);
    }
    
    init(user: User) {
        console.log(user);
    }
}