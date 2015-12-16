import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {Path} from '../../../config/config';
import {BaseComponent} from '../../../config/imports/shared';

import {AppService, UserService, RouterService} from '../../../config/imports/service';

import {Route} from '../../../config/routes';
import {Event} from '../../../service/model/event';
import {User} from '../../../service/model/user';

@Component({
    selector: 'header-nav',
    templateUrl: Path.Component('navigation/header-nav/header-nav.component.html'),
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