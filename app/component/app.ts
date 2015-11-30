import {Component, bootstrap, bind, ViewEncapsulation, CORE_DIRECTIVES, ElementRef, Attribute} from 'angular2/angular2';
import {Location, RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

/* services */
import {AppService} from '../service/app';
import {RouterService, AuthRouterOutlet} from '../service/router';
import {ApiService} from '../service/api';
import {UserService} from '../service/user';

/* components */
import {BaseComponent} from './shared/base';
import {HeaderNavComponent} from './navigation/header-nav';
import {SlidingNavComponent} from './navigation/sliding-nav';
import {FooterNavComponent} from './navigation/footer-nav';
import {ModalComponent} from './shared/modal';

/* models */
import {RouteComponentMap} from '../model/routes';
import {Event} from '../model/event';
import {User} from '../model/user';
import {Alert} from '../model/alert';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    templateUrl: '/view/app.html',
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

bootstrap(AppComponent, [AppService, RouterService, AuthRouterOutlet, UserService, ApiService, ModalComponent, HTTP_PROVIDERS, ROUTER_PROVIDERS, ElementRef, bind(LocationStrategy).toClass(HashLocationStrategy)]);