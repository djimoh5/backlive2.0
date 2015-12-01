import {Component, bootstrap, bind, ViewEncapsulation, CORE_DIRECTIVES, ElementRef, Attribute} from 'angular2/angular2';
import {Location, RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

/* services */
import {AppService} from '../../service/app';
import {RouterService, AuthRouterOutlet} from '../../service/router';
import {ApiService} from '../../service/api';
import {UserService} from '../../service/user';

/* components */
import {BaseComponent} from '../shared/base';
import {ModalComponent} from '../shared/modal';

/* models */
import {RouteComponentMap} from '../../config/routes-marketing';
import {Event} from '../../model/event';
import {User} from '../../model/user';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: '/view/app.html',
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

bootstrap(AppComponent, [AppService, RouterService, AuthRouterOutlet, UserService, ApiService, ModalComponent, HTTP_PROVIDERS, ROUTER_PROVIDERS, ElementRef, bind(LocationStrategy).toClass(HashLocationStrategy)]);