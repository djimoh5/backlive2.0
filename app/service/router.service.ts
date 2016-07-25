import {Injectable, Directive, ElementRef, DynamicComponentLoader, Type, ViewContainerRef, ApplicationRef, ComponentFactory, ResolvedReflectiveProvider} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, RouterConfig, Route, RouterOutletMap, ActivatedRoute, ActivatedRouteSnapshot, UrlTree, NavigationStart, NavigationEnd} from '@angular/router';
import {RouterOutlet} from '@angular/router/src/directives/router_outlet';
import {Location} from '@angular/common';

import {Observable, Subscribable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {Common} from 'backlive/utility';
import {Config} from 'backlive/config';

declare var System: any;

@Injectable()
export class RouterService {
    static activeRoute: ActivatedRouteSnapshot;
    static activeUrl: string;
    
    private router: Router;
    private location: Location;
    private isActiveRouteTree: ActivatedRoute[];
    
    private backSubcriber: Function; //current subscriber to the browser back button
    private routerSubcriber: Function; //current subscriber to route changes
    private navigationStartSubcriber: Function; //subscribe to navigation start event
    private urlSubscribers: Function[];
    private paramsSubscribers: { [key: number]: Function };
    
    private titleService: Title;
    private linkUrlCache: { [key: string]: string } = {};
    private currentParams: { [key: string]: any } = {};
    private currentQueryParams: { [key: string]: any };
    private subscriptionsToParams: Subscription[] = [];

	constructor(router: Router, location: Location, applicationRef: ApplicationRef, titleService: Title) {
		this.router = router;
        this.location = location;

        this.titleService = titleService;
        this.urlSubscribers = [];
        this.paramsSubscribers = {};
        this.currentParams = {};
        this.currentQueryParams = {};

        router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                this.subscriptionsToParams.forEach((sub) => sub.unsubscribe());
                this.subscriptionsToParams = [];
                this.currentParams = {};

                if (this.navigationStartSubcriber && RouterService.activeUrl !== e.url) {
                    this.navigationStartSubcriber(e.url);
                    this.navigationStartSubcriber = null;
                }
            }

            if (e instanceof NavigationEnd) {
                RouterService.activeUrl = e.url;
                this.setTitle();
                this.isActiveRouteTree = null;
                
                if (!!document['documentMode']) {
                    applicationRef.zone.run(() => applicationRef.tick());
                }

                if (this.routerSubcriber) {
                    this.routerSubcriber(e.url);
                }

                if (this.paramsSubscribers) {
                    var tree = this.getRouteTree();
                    tree.forEach((route) => {
                        this.subscriptionsToParams.push(
                            route.params.subscribe((params) => {
                                this.updateParams(params);
                            })
                        );
                    });
                }
            }
        });

        this.initSubscribers();       
    }

    initSubscribers() {
        this.location.subscribe((value: any) => {
            if (this.backSubcriber) {
                this.backSubcriber(value);
            }
        });

        this.subscribeToParams(-1, (params) => {
            for (var key in params) {
                this.currentParams[key] = params[key];
            }
        });

        this.router.routerState.queryParams.subscribe((params) => {
            //Update the current query params every time the router changes
            this.currentQueryParams = params;
            this.updateParams(params);
        }); 
    }

    params(key: string) {
        if (Common.isDefined(RouterService.activeRoute.params[key])) {
            return RouterService.activeRoute.params[key];
        }
        else {
            var tree: ActivatedRoute[] = this.getRouteTree();

            for (let i = tree.length - 1; i >= 0; i--) {
                var params = tree[i].snapshot.params;
                if (Common.isDefined(params[key])) {
                    return params[key];
                }
            }
        }

        return this.currentQueryParams[key];
    }

    getQueryParams() {
        return this.currentQueryParams;
    }

    url() {
        return this.location.path();
    }

    isRouteActive(route: RouteInfo, componentExactMatch: boolean = false, matchParams: {[key: string]: any } = null) {
        if (componentExactMatch) {
            var match: boolean = RouterService.activeRoute.component === route.component;
            if (match && matchParams) {
                for (var key in RouterService.activeRoute.params) {
                    if (matchParams[key] !== RouterService.activeRoute.params[key]) {
                        return false;
                    }
                }
            }
            
            return match;
        }

        if (!this.isActiveRouteTree) {
            this.isActiveRouteTree = this.getRouteTree();
        }

        var activeRoute: ActivatedRoute;

        for (let i = 0; activeRoute = this.isActiveRouteTree[i]; i++) {
            if (activeRoute.component === route.component) {
                return true;
            }
        }

        return false;
    }

    private getRouteTree(): ActivatedRoute[] {
        var activeRouteTree = [];
        var loop = this.router.routerState.children(this.router.routerState.root);

        while (loop && loop.length > 0) {
            var newLoop = [];

            loop.forEach(l => {
                activeRouteTree.push(l);
                newLoop = this.router.routerState.children(l);
            });

            loop = newLoop;
        }

        return activeRouteTree;
    }

    navigate(route: RouteInfo, event: MouseEvent = null, queryParams: {} = null) {
        var params = route.params;
        route.params = null;

        var query = {};
        if (!queryParams) {
            //if the user doesn't supply any query params, keep the current ones
            query = this.getQueryParams();
        }

        if(Config.APP_CRASHED) {
            window.location.href = this.getLinkUrl(route, params);
            return;
        }

        if (!event || !(event.shiftKey || event.ctrlKey)) {
            this.router.navigate(this.getRouteLink(route, params), { queryParams: query });
            this.notifyUrlSubscribers(this.getLinkUrl(route, params));
        }
        else {
            window.open(this.getLinkUrl(route, params));
        }
	}
    
    setTitle() {
        if (RouterService.activeRoute && RouterService.activeRoute.url && RouterService.activeRoute.url[0]) {
            var pageTitle = RouterService.activeRoute.url[0].path;
            pageTitle = pageTitle.toLowerCase().replace(/-/g, ' ').replace(/\b[a-z](?=[a-z]{2})/g, function(letter) { return letter.toUpperCase(); } );
            this.titleService.setTitle('BackLive | ' + pageTitle);
        }
    }

    getLinkUrl(route: RouteInfo, params: {} = null, relativeToBase: boolean = false) {
        var cacheKey = route.link[0] + JSON.stringify(params);
        var linkUrl = this.linkUrlCache[cacheKey];

        if (!linkUrl) {
            var tree: UrlTree = this.router.createUrlTree(this.getRouteLink(route, params));

            if (tree) {
                linkUrl = this.router.serializeUrl(tree);
                this.linkUrlCache[cacheKey] = linkUrl;
            }
        }

        return (relativeToBase ? '' : Config.SITE_URL) + linkUrl;
    }
    
    private getRouteLink(route: RouteInfo, params: {}) {
        var routeLink = [route.link[0]];
        var optionalParams = {};
        var hasOptionalParams: boolean = false;

        if (params) {
            var linkParams = route.link[1] || {};
            for (var key in params) {
                if (linkParams[key] === true) {
                    routeLink.push(params[key]);
                }
                else if (!Common.isDefined(linkParams[key])) {
                    //check if this a param from your parent route that needs to be replaced
                    routeLink[0] = routeLink[0].replace(`:${key}`, params[key]);
                }
                else {
                    optionalParams[key] = params[key];
                    hasOptionalParams = true;
                }
            }
        }

        if (hasOptionalParams) {
            routeLink.push(optionalParams);
        }

        return routeLink;
    }
    
    subscribe(callback: Function) {
        this.routerSubcriber = callback;
    }

    unsubscribe() {
        this.routerSubcriber = null;
    }

    subscribeToNavigationStart(callback: Function) {
        this.navigationStartSubcriber = callback;
    }

    subscribeToBack(callback: Function) {
        this.backSubcriber = callback;
    }
    
    unsubscribeToBack() {
        this.backSubcriber = null;
    }

    subscribeToParams(componentId: number, callback: Function) {
        this.paramsSubscribers[componentId] = callback;
    }

    unsubsribeToParams(componentId: number) {
        delete this.paramsSubscribers[componentId];
    }
    
    registerUrlSubscriber(subscriber: Function) {
        this.urlSubscribers.push(subscriber);
    }

    private updateParams(params: { [key: string]: any }) {
        for (var key in this.paramsSubscribers) {
            this.paramsSubscribers[key](params);
        }
    }
    
    notifyUrlSubscribers(path: string) {
        setTimeout(() => {
            this.urlSubscribers.forEach(subscriber => {
                subscriber(path);
            });
        }, 1000);
    }

	// application wide routes, these are passed to the @RouteConfig of the main app component
    static AppRoutes(routeInfos: {}, authGuard: any = null): RouterConfig {
		var routerConfig: RouterConfig = [];
        var routeInfo: RouteInfo;

        for (var key in routeInfos) {
            routeInfo = routeInfos[key];
            var paths = this.routeToPaths(routeInfo);

            if (routeInfo.children && paths.length > 1) {
                throw `Parent routes can only have one path. Please ensure all parameters are set to required (true): ${paths.length} paths found - ${JSON.stringify(paths)}`;
            }

            if (routeInfo.requireAccountNumber) {
                routeInfo.link[0] = `/:${Config.AccountIdRouteKey}${routeInfo.link[0]}`;
            }

            for (var j = paths.length - 1; j >= 0; j--) { //add deepest paths first
                if (routeInfo.requireAccountNumber) {
                    paths[j] = `:${Config.AccountIdRouteKey}/${paths[j]}`;
                }

                var route: Route = { path: paths[j], component: routeInfo.component };

                if (routeInfo.children) {
                    var mergedPath = this.mergeRoutePaths(routeInfo.link[0], paths[j]);

                    for (var key in routeInfo.children) {
                        routeInfo.children[key].link[0] = mergedPath + routeInfo.children[key].link[0];
                    }

                    route.children = RouterService.AppRoutes(routeInfo.children, authGuard);
                }

                if (routeInfo.redirectTo) {
                    route.redirectTo = routeInfo.redirectTo;
                }

                if(routeInfo.isNotFound) {
                    routerConfig.push({ path: '**', component: routeInfo.component });
                }

                if (!routeInfo.isPublic && authGuard) {
                    route.canActivate = [authGuard];
                }
                
                routerConfig.push(route);
            }
		}

		return routerConfig;
	}
    
    private static baseRouteLink(routeLink: any[]) {
		var paths = routeLink[0].split('/');
        return paths[paths.length - 1];
    }

    private static mergeRoutePaths(path: string, leafPath: string) {
        var paths = path.split('/');
        paths[paths.length - 1] = leafPath;
        return paths.join('/');
    }
    
    private static routeToPaths(route: RouteInfo) {
		var path = [this.baseRouteLink(route.link)];
        
        if(route.link.length > 1) {
            var tempPath = path[0];
            for(var key in route.link[1]) {
                if(route.link[1][key] === true) {
                    path[0] += (path[0].length > 0 ? '/:' : ':') + key;
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
    redirectTo?: string;
    children?: {},
    requireAccountNumber?: boolean,
	isPublic?: boolean, //route does not require authentication
    isNotFound?: boolean; //route not found / access denied page
    
    params?: { [key: string]: any } //optional params that can be set when navigating to a route
}