import {Injectable, Directive, ElementRef, DynamicComponentLoader} from 'angular2/angular2';
import {Location, Router, RouteDefinition, RouterOutlet, ComponentInstruction} from 'angular2/router';

import {UserService} from '../service/user';
import {Common, Object} from '../utility/common';

// import all components that will be used as routes
import {SplashComponent} from '../component/home/splash';
import {LoginComponent} from '../component/home/login';
import {DashboardComponent} from '../component/home/dashboard';
import {ResearchComponent} from '../component/research/research';
import {BacktestComponent} from '../component/backtest/backtest';
import {PortfolioComponent} from '../component/portfolio/portfolio';

// define routes and map to components
interface RouteMap {
	route: string[],
	component: any,
	isRoot?: boolean,
	isPublic?: boolean
}

export class Route {
	public static get Dashboard(): string[] { return ['/Dashboard'] };
	public static get Splash(): string[] { return ['/Splash'] };
    public static get Login(): string[] { return ['/Login'] };
	public static get Research(): string[] { return ['/Research'] };
	public static get Backtest(): string[] { return ['/Backtest'] };
	public static get Portfolio(): string[] { return ['/Portfolio'] };
}

var RouteComponentMap: RouteMap[]  = [
	{ route: Route.Dashboard, component: DashboardComponent, isRoot: true },
	{ route: Route.Splash, component: SplashComponent, isPublic: true },
	{ route: Route.Login, component: LoginComponent, isPublic: true },
	{ route: Route.Research, component: ResearchComponent },
	{ route: Route.Backtest, component: BacktestComponent },
	{ route: Route.Portfolio, component: PortfolioComponent }
];

/*** WHEN ADDING NEW ROUTES, SHOULD ONLY EVER NEED TO UPDATE ABOVE ROUTE MAPPING, AND NOT THE ACTUAL ROUTER SERVICE BELOW ***/
@Directive({selector: 'auth-router-outlet'})
export class AuthRouterOutlet extends RouterOutlet {
	router: Router;
	publicRoutes: string[] = [];
	
	constructor(elementRef: ElementRef, loader: DynamicComponentLoader, parentRouter:Router) {
		super(elementRef, loader, parentRouter, null);
		this.router = parentRouter;	
	}
	
	activate(nextInstruction: ComponentInstruction) : Promise<any> {
		var route = nextInstruction.componentType == RouterService.rootRouteMap.component 
					? RouterService.rootRouteMap.route : RouterService.pathRoute(nextInstruction.urlPath);
		
		RouterService.lastRoute = route;
		
		if(!RouterService.enabled) {
			nextInstruction = this.router.generate(Route.Splash).component;
		}
		else if(RouterService.accessDenied(route)) {
			this.router.navigate(Route.Login); //include this only if we don't want url to show as page user tried to access
			nextInstruction = this.router.generate(Route.Login).component;
		}
		
		return super.activate(nextInstruction);
	}
}

@Injectable()
export class RouterService {
	private static router: Router;
	private static location: Location;
	private static publicRoutes: string[] = [];
	private static userService: UserService;
	
	static enabled: boolean;
	static lastRoute: string[];
	static rootRouteMap: any;
	
	constructor(router: Router, location: Location, routerOutlet: AuthRouterOutlet, userService: UserService) {
		RouterService.router = router;
		RouterService.userService = userService;
		RouterService.location = location;
		
		RouteComponentMap.forEach(map => {
			if(map.isPublic) {
				RouterService.publicRoutes.push(map.route[0]);
			}
		})
	}
	
	isRouteActive(route: string[]) {
		return RouterService.router.isRouteActive(RouterService.router.generate(route));
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
		
		for(var i = 0, map: any; map = RouteComponentMap[i]; i++) {
			if(map.isRoot) {
				this.rootRouteMap = map;
			}
			
			routeDefinitions.push({ path: map.isRoot ? '/' : this.routePath(map.route), component: map.component, as: this.routeAlias(map.route) });
		}
				
		return routeDefinitions;
	}
	
	static enableRouting() {
		this.enabled = true;
		var split = this.lastRoute[0].split('/');
		
		if(split.length > 2) {
			this.router.navigate(['/' + split[1], { id: split[2] }]);
		}
		else {
			this.router.navigate(this.lastRoute);
		}
	}
    
    static accessDenied(route: string[] = null) {
		if(!route) {
			route = RouterService.pathRoute(this.location.path());
		}
		
        return !this.userService.user && !Common.inArray(route[0], this.publicRoutes);
    }

	static pathRoute(path: string) {
		var firstChar = path.substring(0, 1);
		
		if(firstChar != '/') {
			path = '/' + path;
			firstChar = '/';
		}
		
		return [firstChar + path.substring(1, 2).toUpperCase() + path.substring(2)];
	}
	
	static routePath(route: string[]) {
		var path = route[0].toLowerCase();
		
		if(route.length > 1) {
			for(var key in route[1]) {
				path += '/:' + key;
			}
		}
		
		return path;
	}
	
	static routeAlias(route: string[]) {
		return route[0].substring(1);
	}
}