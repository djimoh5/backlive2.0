import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {Path} from 'backlive/marketing/config';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';

/* services */
import {AppService, RouterService, ApiService, UserService, RouteInfo} from 'backlive/service';

/* models */
import {Route} from 'backlive/marketing/routes';
import {AppEvent, User} from 'backlive/service/model';

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.component.html'),
    directives: [ROUTER_DIRECTIVES, ModalComponent]
})
export class AppComponent extends BaseComponent {
    userService: UserService;
    routerService: RouterService;
    isPageLoading: boolean;

    constructor(routerService: RouterService, appService: AppService, userService: UserService) {
        super(appService);
        this.appService = appService;
        this.userService = userService;
        this.routerService = routerService;
    }
}