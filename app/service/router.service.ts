import {Injectable, Directive, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {Location, Router, RouteDefinition, RouterOutlet, ComponentInstruction} from 'angular2/router';

import {UserService} from './user.service';
import {Common} from 'backlive/utility';

@Directive({selector: 'auth-router-outlet'})
export class AuthRouterOutlet extends RouterOutlet {
	router: Router;
	publicRoutes: string[] = [];
	
	constructor(elementRef: ElementRef, loader: DynamicComponentLoader, parentRouter:Router) {
		super(elementRef, loader, parentRouter, null);
		this.router = parentRouter;	
	}
	
	activate(nextInstruction: ComponentInstruction) : Promise<any> {
		var route = RouterService.rootRouteMap && nextInstruction.componentType == RouterService.rootRouteMap.component 
					? RouterService.rootRouteMap.route : RouterService.pathRoute(nextInstruction.urlPath);
		
		RouterService.lastRoute = route;
		
		if(!RouterService.enabled) {
			nextInstruction = this.router.generate(RouterService.splashRoute).component;
		}
		else if(RouterService.accessDenied(route)) {
			this.router.navigate(RouterService.defaultRoute); //include this only if we don't want url to show as page user tried to access
			nextInstruction = this.router.generate(RouterService.defaultRoute).component;
		}

		return super.activate(nextInstruction);
	}
}

@Injectable()
export class RouterService {
	private static router: Router;
	private static location: Location;
	private static routeMap: RouteMap[];
	private static publicRoutes: string[] = [];
	private static userService: UserService;

	static enabled: boolean;
	static lastRoute: string[];
	static rootRouteMap: any;
	static splashRoute: any;
	static defaultRoute: any;
	
	static childRouteIdentifier: string = '/...';
	
	constructor(router: Router, location: Location, routerOutlet: AuthRouterOutlet, userService: UserService) {
		RouterService.router = router;
		RouterService.userService = userService;
		RouterService.location = location;
		
		RouterService.routeMap.forEach(map => {
			if(map.isPublic) {
				RouterService.publicRoutes.push(RouterService.baseRoute(map.route));
			}
			
			if(map.isSplash){
				RouterService.splashRoute = map.route;
			}
			
			if(map.isDefault){
				RouterService.defaultRoute = map.route;
			}
		});
	}
	
	isRouteActive(route: string[]) {
		return route ? RouterService.router.isRouteActive(RouterService.router.generate(route)) : false;
	}
	
	subscribe(callback: Function) {
		RouterService.router.subscribe((route: string) => callback(route));
	}
	
	navigate(route: string[]) {
		RouterService.router.navigate(route);
	}
	
	// application wide routes, these are passed to the @RouteConfig of the main app component
	static get AppRoutes(): RouteDefinition[] {
		var routeDefinitions: RouteDefinition[] = [];
		
		for(var i = 0, map: any; map = this.routeMap[i]; i++) {
			if(map.isRoot) {
				this.rootRouteMap = map;
			}
			
			routeDefinitions.push({ path: map.isRoot ? '/' : this.routePath(map.route), component: map.component, name: this.routeAlias(map.route) });
		}
				
		return routeDefinitions;
	}
	
	static setRouteMap(routeMap: RouteMap[]) {
		this.routeMap = routeMap;
	}
	
	static enableRouting() {
		this.enabled = true;
		
		if(!this.lastRoute) {
			this.lastRoute = this.pathRoute(this.location.path());
		}
		
		this.router.navigate(this.lastRoute);
	}
    
    static accessDenied(route: string[] = null) {
		if(!route) {
			route = RouterService.pathRoute(this.location.path());
		}
		
        return !this.userService.user && !Common.inArray(route[0], this.publicRoutes);
    }

	static pathRoute(path: string) {
		if(path.substring(0, 1) != '/') {
			path = '/' + path;
		}
		
		path = '/' + path.substring(1, 2).toUpperCase() + path.substring(2);
	
		//check if there's an :id path in route
		var split = path.split('/'),
			idPath = split[2];

		if(idPath) {
			path = '/' + split[1];
		}
		
		for(var i = 0, map: RouteMap; map = this.routeMap[i]; i++) {
			var baseRoute = this.baseRoute(map.route);

			if(baseRoute == path) {
				if(map.route[0] != baseRoute) { //route has child routes
					return [baseRoute + (idPath ? ('/' + idPath.substring(0, 1).toUpperCase() + idPath.substring(1)) : '')];
				}
				else if(idPath) {
					if(map.route[1]) {
						map.route[1].id = idPath;
					}
				}
				
				return map.route;
			}
		}

		return this.defaultRoute;
	}
	
	static baseRoute(route: string[]) {
		return route[0].replace(this.childRouteIdentifier, '');	
	}
	
	static routePath(route: any[]) {
		var path = route[0].toLowerCase();
		
		if(route.length > 1) {
			for(var key in route[1]) {
				path += '/:' + key;
			}
		}
		
		return path;
	}
	
	static routeAlias(route: string[]) {
		return this.baseRoute(route).substring(1);
	}
}

export interface RouteMap {
	route: any[],
	component: any,
	isRoot?: boolean,
	isPublic?: boolean,
	isDefault?: boolean,
	isSplash?: boolean
}