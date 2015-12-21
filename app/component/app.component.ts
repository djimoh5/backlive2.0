import {Component, bootstrap, bind, ViewEncapsulation, CORE_DIRECTIVES, ElementRef, Attribute} from 'angular2/angular2';
import {Location, RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Path} from '../config/config';

import {RouteComponentMap} from '../config/routes';

/* services */
import {AppService, RouterService, AuthRouterOutlet, ApiService, UserService} from '../config/imports/service';

/* components */
import {BaseComponent, ModalComponent} from '../config/imports/shared';
import {HeaderNavComponent, SlidingNavComponent, FooterNavComponent} from '../config/imports/navigation';

/* models */
import {Event} from '../service/model/event';
import {User} from '../service/model/user';
import {Alert} from '../service/model/alert';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: Path.Component('app.component.html'),
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, AuthRouterOutlet, HeaderNavComponent, SlidingNavComponent, FooterNavComponent, ModalComponent]
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
        
        userService.getUser().then(user => this.initRoute(user));
        
        this.appService.subscribe(Event.Navigate, (route: string[]) => this.navigate(route));
        this.appService.subscribe(Event.Alert, this.showAlert);
        this.appService.subscribe(Event.SlidingNavVisible, (visible: boolean) => this.isSlidingNavVisible = visible);
        this.appService.subscribe(Event.PageLoading, (loading: boolean) => this.isPageLoading = loading);
    }
    
    initRoute(user: User) {
        console.log(user);
        RouterService.enableRouting();
    }
    
    navigate(route: string[]) {
        this.routerService.navigate(route);
    }
    
    showAlert=(alert: Alert) => { /* this is an example of an alternate way to preserve "this" in callbacks */
        console.log(alert);
    }
}