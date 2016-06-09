import {Injectable, Directive, ElementRef, DynamicComponentLoader, Type, ViewContainerRef, ApplicationRef} from '@angular/core';
import {Router, RouteDefinition, AsyncRoute, RouterOutlet, ComponentInstruction, Instruction} from '@angular/router-deprecated';
import {Location} from '@angular/common';

import {UserService} from './user.service';
import {Common} from 'backlive/utility';
import {Config} from 'backlive/config';

declare var System: any;
declare var Appcues: any;
declare var ga: any; //Google  Analytics

@Directive({selector: 'auth-router-outlet'})
export class AuthRouterOutlet extends RouterOutlet {
	router: Router;
	publicRoutes: string[] = [];
	
	constructor(viewContainerRef: ViewContainerRef, loader: DynamicComponentLoader, parentRouter:Router) {
		super(viewContainerRef, loader, parentRouter, null);
		this.router = parentRouter;
	}
	
	activate(nextInstruction: ComponentInstruction) : Promise<any> {
        RouterService.lastPath = RouterService.location.path();
        RouterService.currentComponent = nextInstruction.componentType;
        RouterService.currentInstruction = nextInstruction;
        
		if(RouterService.enabled) {
			if(RouterService.accessDenied(nextInstruction)) {
                nextInstruction = this.router.generate(RouterService.notFoundRoute.link).component;
            }
            
            return super.activate(nextInstruction);
		}
	}
}

@Injectable()
export class RouterService {
	static router: Router;
	private static routes: RouteInfo[];
	private static publicRoutes: RouteInfo[] = [];
	private static userService: UserService;
    
    static location: Location;
	static enabled: boolean;
	static lastPath: string;
    static currentComponent: any;
    static currentInstruction: ComponentInstruction;
    
    static defaultRoute: RouteInfo;
	static notFoundRoute: RouteInfo;
	
	static childRouteIdentifier: string = '/...';
    
    backSubcriber: Function; //current subscriber to the browser back button
    routerSubcriber: Function; //current subscriber to route changes
	
	constructor(router: Router, location: Location, applicationRef: ApplicationRef) {
		RouterService.router = router;
		RouterService.location = location;

        if (RouterService.routes) {
            RouterService.routes.forEach(routeInfo => {
                if (routeInfo.isNotFound) {
                    RouterService.notFoundRoute = routeInfo;
                }
            });
        }

        router.subscribe((route: string) => {
            if (!!document['documentMode']) {
                applicationRef.zone.run(() => applicationRef.tick());
            }

            if (this.routerSubcriber) {
                this.routerSubcriber(route);
            }
        });

        location.subscribe((value: any) => {
            if (this.backSubcriber) {
                this.backSubcriber(value);
            }
        });
	}
	
	isRouteActive(route: RouteInfo, componentExactMatch: boolean = false) {
        return RouterService.isRouteActive(RouterService.router, route, componentExactMatch);
	}
    
    static isRouteActive(router: Router, route: RouteInfo, componentExactMatch: boolean = false) {
        return route ? 
                (route.component === RouterService.currentComponent || (!componentExactMatch && router.isRouteActive(router.generate([route.link[0]]))))
                : false;
	}
    
	subscribe(callback: Function) {
        this.routerSubcriber = callback;
    }

    unsubscribe() {
        this.routerSubcriber = null;
    }
    
    subscribeToBack(callback: Function) {
        this.backSubcriber = callback;
    }
    
    unsubscribeToBack() {
        this.backSubcriber = null;
    }
	
	navigate(route: RouteInfo, event: MouseEvent = null) {
        var params = route.params;
        route.params = null;
        
        if(Config.APP_CRASHED) {
            window.location.href = this.getLinkUrl(route, params);
            return;
        }
        
        if(!event || !(event.shiftKey || event.ctrlKey)) {
		    RouterService.router.navigate(this.getRouteLink(route, params));
            this.setTrackingInfo(this.getLinkUrl(route, params));
        }
        else {
            window.open(this.getLinkUrl(route, params));
        }
	}

    getLinkUrl(route: RouteInfo, params: {} = null, relativeToBase: boolean = false) {
        var instr: Instruction = RouterService.router.generate(this.getRouteLink(route, params));
        if(instr) {
            return (relativeToBase ? '' : Config.SITE_URL) + '/' + instr.toLinkUrl();
        }
    }
    
    private getRouteLink(route: RouteInfo, params: {}) {
        return params && route.link[1] ? [route.link[0], params] : [route.link[0]];
    }
    
    pushView(path: string) {
        RouterService.location.go(path);
        this.setTrackingInfo(path);
    }

    replaceView(path: string) {
        RouterService.location.replaceState(path);
        this.setTrackingInfo(path);
    }
    
    setTrackingInfo(path: string){
        if(typeof(Appcues) !== 'undefined') {
            Appcues.identify({ path: path });
            
            setTimeout(() => {
                Appcues.start();
            }, 2000);
        }

        if (typeof (ga) !== 'undefined') {
            ga('set', 'page', path);
            ga('send', 'pageview');
        }
    }

	// application wide routes, these are passed to the @RouteConfig of the main app component
	static AppRoutes(routeInfos: {}, hasParentRoute: boolean = false): RouteDefinition[] {
		var routeDefinitions: RouteDefinition[] = [];
        var routeInfo: RouteInfo;
        var routes: RouteInfo[] = [];
        
        for(var key in routeInfos) {
            routeInfo = routeInfos[key];
            routes.push(routeInfo);
            
            if(routeInfo.isRoot || routeInfo.isDefault) {
                RouterService.defaultRoute = routeInfo;
            }
            
            if(routeInfo.isPublic) {
                RouterService.publicRoutes.push(routeInfo);
            }
        }
        
        if(!hasParentRoute) {
            this.routes = routes;
        }
        
        var defaultFound = false;

		for(var i = 0; routeInfo = routes[i]; i++) {
            var alias = this.routeAlias(routeInfo, hasParentRoute);
            var paths = this.routeToPaths(routeInfo, hasParentRoute);
            
            for(var j = paths.length - 1; j >= 0; j--) { //add deepest paths first
                var routeDefinition: RouteDefinition = Common.isString(routeInfo.component) ? new AsyncRoute({
                        path: paths[j],
                        loader: this.getRouteLoader(routeInfo.path, <string> routeInfo.component),
                        name: alias
                    }) : { path: paths[j], name: alias, component: <Type> routeInfo.component }
            
                if(routeInfo.isDefault && !defaultFound && j === 0) {
                    routeDefinition.useAsDefault = true;
                    defaultFound = true;
                }
                
                if(routeInfo.isNotFound) {
                    routeDefinitions.push({ path: '/**', name: alias, component: <Type> routeInfo.component });
                }
                
                routeDefinitions.push(routeDefinition);
            }
		}
				
		return routeDefinitions;
	}
    
    static getRouteLoader(path: string, component: string) {
        return () => System.import(path).then(m => m[component]);
    }
    
    static enableRouting() {
        if(!this.enabled) {
            this.enabled = true;

            if(this.lastPath) {
                this.router.navigateByUrl(this.lastPath);
            }
            else if(RouterService.defaultRoute) {
                this.router.navigate(RouterService.defaultRoute.link);
            }
        }
	}
    
    static accessDenied(componentInstruction: ComponentInstruction) {
        return false;
        
        /*for(var i = 0, routeInfo; routeInfo = this.publicRoutes[i]; i++) {
            if(routeInfo.component === componentInstruction.componentType) {
                return false;
            }
        }
		
        return true;*/
    }

    static baseRouteLink(routeLink: any[], hasParentRoute: boolean) {
		var paths = routeLink[0].split('/');
        return '/' + paths[paths.length - 1];
	}
    
    static routeAlias(route: RouteInfo, hasParentRoute: boolean) {
        var base = this.baseRouteLink(route.link, hasParentRoute);
		return base.substring(1);
	}
    
    static routeToPaths(route: RouteInfo, hasParentRoute: boolean) {
        if(route.isRoot) {
            return ['/'];
        }
        
		var path = [this.baseRouteLink(route.link, hasParentRoute).toLowerCase()];
        
        if(route.hasChildRoutes) {
            path[0] += this.childRouteIdentifier;
        }
        else if(route.link.length > 1) {
            var tempPath = path[0];
            for(var key in route.link[1]) {
                if(route.link[1][key] === true) {
                    path[0] += '/:' + key;
                    tempPath = path[0];
                }
                else {
                    tempPath += '/:' + key;
                    path.push(tempPath);
                }
            }
        }
        
		return path;
	}
}

export interface RouteInfo {
	link: any[],
    component: string | Type;
    path?: string;
    hasChildRoutes?: boolean,
	isRoot?: boolean, //route should be mapped to web root '/'
	isPublic?: boolean, //route does not require authentication
	isDefault?: boolean, //on login navigate to this route
    isNotFound?: boolean; //route not found / access denied page
    
    params?: { [key: string]: any } //optional params that can be set when navigating to a route
}