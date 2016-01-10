import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService, RouterService} from 'backlive/service';

import {Route} from 'backlive/routes';
import {AppEvent} from '../../../service/model/app-event';
import {User} from '../../../service/model/user';

@Component({
    selector: 'header-nav',
    templateUrl: Path.ComponentView('navigation/header-nav'),
    directives: []
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
            window.location.href = '/';
        }
    }
    
    navigateTo(navItem: NavItem) {
        this.appService.notify(AppEvent.Navigate, navItem.route);
    }
}


class NavItem {
    name: string;
    route: string[];
}