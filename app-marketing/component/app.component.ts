import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Path} from 'backlive/marketing/config';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';

/* services */
import {AppService, RouterService, AuthRouterOutlet, ApiService, UserService} from 'backlive/service';

/* models */
import {RouteComponentMap} from 'backlive/marketing/routes';
import {AppEvent} from '../../app/service/model/app-event';
import {User} from '../../app/service/model/user';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.component.html'),
    directives: [ROUTER_DIRECTIVES, AuthRouterOutlet, ModalComponent]
})
@RouteConfig(RouterService.AppRoutes)
export class AppComponent extends BaseComponent {
    userService: UserService;
    routerService: RouterService;
    isPageLoading: boolean;

    constructor(routerService: RouterService, appService: AppService, userService: UserService) {
        super(appService);
        this.appService = appService;
        this.userService = userService;
        this.routerService = routerService;
        
        this.subscribeEvent(AppEvent.Navigate, (route: string[]) => this.navigate(route));

        RouterService.enabled = true;
    }

    navigate(route: string[]) {
        this.routerService.navigate(route);
    }
}