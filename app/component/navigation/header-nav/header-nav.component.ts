import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService, RouterService, RouteInfo} from 'backlive/service';

import {Route} from 'backlive/routes';
import {User} from 'backlive/service/model';

@Component({
    selector: 'header-nav',
    templateUrl: Path.ComponentView('navigation/header-nav'),
    styleUrls: [Path.ComponentStyle('navigation/header-nav')]
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
            { name: "Strategy", route: Route.Network },
            { name: "Research", route: Route.Research }
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
    
    navigateTo(navItem: NavItem, event: MouseEvent) {
        this.appService.navigate(navItem.route, null, event);
        event.preventDefault();
    }
    
    getRouteUrl(navItem: NavItem) {
        return this.routerService.getLinkUrl(navItem.route);
    }
}


class NavItem {
    name: string;
    route: RouteInfo;
}