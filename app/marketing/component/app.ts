import {Component, bootstrap, bind, ViewEncapsulation, CORE_DIRECTIVES, ElementRef, Attribute} from 'angular2/angular2';
import {Location, RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Path} from '../config/config';

/* components */
import {BaseComponent, ModalComponent} from '../../config/imports/shared';

/* services */
import {AppService, RouterService, AuthRouterOutlet, ApiService, UserService} from '../../config/imports/service';

/* models */
import {RouteComponentMap} from '../config/routes';
import {Event} from '../../service/model/event';
import {User} from '../../service/model/user';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.html'),
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, AuthRouterOutlet, ModalComponent]
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
        
        this.appService.subscribe(Event.Navigate, (route: string[]) => this.navigate(route));

        RouterService.enabled = true;
    }

    navigate(route: string[]) {
        this.routerService.navigate(route);
    }
}