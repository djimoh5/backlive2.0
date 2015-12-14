import {Component, bootstrap, bind, ViewEncapsulation, CORE_DIRECTIVES, ElementRef, Attribute} from 'angular2/angular2';
import {Location, RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

/* services */
import {AppService, RouterService, AuthRouterOutlet, ApiService, UserService} from '../../config/imports/service';

/* components */
import {BaseComponent} from '../../component/shared/base';
import {ModalComponent} from '../../component/shared/modal/modal';

/* models */
import {RouteComponentMap} from '../config/routes';
import {Event} from '../../service/model/event';
import {User} from '../../service/model/user';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: '/app/marketing/component/app.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, AuthRouterOutlet, ModalComponent]
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
        
        this.appService.subscribe(Event.Navigate, (route: string[]) => this.navigate(route));

        RouterService.enabled = true;
    }

    navigate(route: string[]) {
        this.routerService.navigate(route);
    }
}