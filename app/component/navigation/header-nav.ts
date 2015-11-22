import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';
import {RouterService, Route} from '../../service/router';
import {UserService} from '../../service/user';

import {Event} from '../../model/event';
import {User} from '../../model/user';

@Component({
    selector: 'header-nav',
    templateUrl: '/view/navigation/header-nav.html',
    directives: [CORE_DIRECTIVES]
})
export class HeaderNavComponent extends BaseComponent {
    routerService: RouterService;
    userService: UserService;
    items: NavItem[];
    
    constructor(routerService: RouterService, appService: AppService, userService:UserService) {
        super(appService);
        this.userService = userService;
        this.routerService = routerService;

        this.items = [
            { name: "Dashboard", route: Route.Dashboard },
            { name: "Research", route: Route.Research },
            { name: "Backtest", route: Route.Backtest },
            { name: "Portfolio", route: Route.Portfolio }
        ];
    }
    
    logout() {
        this.userService.logout().then(() => this.logoutCompete());
    }
    
    logoutCompete() {
        if(!this.userService.user) {
            this.appService.notify(Event.Navigate, Route.Login);
        }
    }
    
    navigateTo(navItem: NavItem) {
        this.appService.notify(Event.Navigate, navItem.route);
    }
}


class NavItem {
    name: string;
    route: string[];
}