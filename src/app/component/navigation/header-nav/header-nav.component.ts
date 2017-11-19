import {Component} from '@angular/core';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService, RouterService, RouteInfo} from 'backlive/service';

import {Route} from 'backlive/routes';

@Component({
    selector: 'header-nav',
    templateUrl: 'header-nav.component.html',
    styleUrls: ['header-nav.component.less']
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