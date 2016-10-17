import {Injectable,Type, ModuleWithProviders} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouterModule, Router, Route, RouterOutletMap, ActivatedRoute, ActivatedRouteSnapshot, UrlTree, NavigationStart, NavigationEnd} from '@angular/router';
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

    private pageTitle: string;
    
    private router: Router;
    private location: Location;
    private isActiveRouteTree: ActivatedRoute[];
    
    private backSubcriber: Function; //current subscriber to the browser back button
    private routerSubcriber: Function; //current subscriber to route changes
    private navigationStartSubcribers: Function[]; //subscribe to navigation start event
    private urlSubscribers: Function[];
    private paramsSubscribers: { [key: number]: RouteParamsCallback };
    private queryParamsSubscribers: { [key: number]: RouteParamsCallback };
    
    private titleService: Title;
    private linkUrlCache: { [key: string]: string } = {};
    private currentParams: { [key: string]: any } = {};
    private currentQueryParams: { [key: string]: any };
    private subscriptionsToParams: Subscription[] = [];
    private subscriptionsToQueryParams: Subscription[] = [];

	constructor(router: Router, location: Location, titleService: Title) {
		this.router = router;
        this.location = location;

        this.titleService = titleService;
        this.urlSubscribers = [];
        this.navigationStartSubcribers = [];
        this.paramsSubscribers = {};
        this.queryParamsSubscribers = {};
        this.currentParams = {};
        this.currentQueryParams = {};

        router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                this.setPageTitle(null);

                this.subscriptionsToParams.forEach((sub) => sub.unsubscribe());
                this.subscriptionsToParams = [];
                this.subscriptionsToQueryParams.forEach((sub) => sub.unsubscribe());
                this.subscriptionsToQueryParams = [];
                this.currentParams = {};

                this.notifyNavigationStartSubscribers();
            }

            if (e instanceof NavigationEnd) {
                RouterService.activeUrl = e.url;
                this.setTitle(e.url);
                this.isActiveRouteTree = null;

                if (this.routerSubcriber) {
                    this.routerSubcriber(e.url);
                }

                this.notifyUrlSubscribers(e.url, this.currentParams);

                var tree = this.getRouteTree();
                if (this.paramsSubscribers) {
                    tree.forEach((route) => {
                        this.subscriptionsToParams.push(
                            route.params.subscribe((params) => {
                                this.updateParams(params);
                            })
                        );
                    });
                }
                if (this.queryParamsSubscribers) {
                    tree.forEach((route) => {
                        this.subscriptionsToQueryParams.push(
                            route.queryParams.subscribe((params) => {
                                this.currentQueryParams = params;
                                this.updateQueryParams(params);
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
    }

    params(key: string) {
        if (Common.isDefined(RouterService.activeRoute.params[key])) {
            return RouterService.activeRoute.params[key];
        }
        else {
            var tree: ActivatedRoute[] = this.getRouteTree();

            for (let i = tree.length - 1; i >= 0; i--) {
                var params = tree[i].snapshot ? tree[i].snapshot.params : {};
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
        if (!this.isActiveRouteTree) {
            this.isActiveRouteTree = this.getRouteTree();
        }

        var activeRoute: ActivatedRoute;
        var fullPath = '';
        var routePath = '/' + route.path;

        for (let i = 0; activeRoute = this.isActiveRouteTree[i]; i++) {
            if (activeRoute.routeConfig.path !== '') {
                fullPath += '/' + activeRoute.routeConfig.path.replace(':[object Object]', ':' + Config.AccountRouteKey); //hack for AOT compiler not supporting object variable in route
            }

            if (!componentExactMatch && fullPath === routePath) {
                return true;
            }
        }

        if (componentExactMatch) {
            var match: boolean = fullPath === routePath;
            if (match && matchParams) {
                for (var key in RouterService.activeRoute.params) {
                    if (matchParams[key] !== RouterService.activeRoute.params[key]) {
                        return false;
                    }
                }
            }

            return match;
        }

        return false;
    }

    activeRoutePath() {
        var routeTree: ActivatedRoute[] = this.getRouteTree();
        var activeRoute: ActivatedRoute;
        var fullPath = '';

        for (let i = 0; activeRoute = routeTree[i]; i++) {
            fullPath += '/' + activeRoute.routeConfig.path;
        }

        return fullPath.substring(1);
    }

    private getRouteTree(): ActivatedRoute[] {
        var activeRouteTree: ActivatedRoute[] = [];
        var loop: ActivatedRoute[] = this.router.routerState.root.children;

        while (loop && loop.length > 0) {
            var newLoop = [];

            loop.forEach(l => {
                activeRouteTree.push(l);
                newLoop = l.children;
            });

            loop = newLoop;
        }

        return activeRouteTree;
    }

    navigate(route: RouteInfo, params: { [key: string]: any }, event: MouseEvent = null, queryParams: {} = null) {
        var query = {};
        if (!queryParams) {
            //if the user doesn't supply any query params, keep the current ones
            query = this.getQueryParams();
        } else {
            query = queryParams;
        }

        if(Config.APP_CRASHED) {
            window.location.href = this.getLinkUrl(route, params);
            return;
        }

        if (!event || !(event.shiftKey || event.ctrlKey)) {
            this.router.navigate(this.getRouteLink(route, params), { queryParams: query });
        }
        else {
            window.open(this.getLinkUrl(route, params));
        }
    }

    open(route: RouteInfo, params: { [key: string]: any }, queryParams: {} = null) {
        window.open(this.getLinkUrl(route, params));
    }

    setPageTitle(pageTitle: string) {
        this.pageTitle = pageTitle;
        this.updatePageTitle(pageTitle);
    }

    private setTitle(url: string) {
        var pageTitle;

        if (RouterService.activeUrl) {
            if (this.pageTitle) {
                pageTitle = this.pageTitle;
            }
            else {
                var urls: string[] = RouterService.activeUrl.split('?')[0].split(';')[0].split('/');
                for (var i = urls.length - 1; i >= 0; i--) {
                    if (urls[i]) {
                        pageTitle = urls[i].toLowerCase().replace(/-/g, ' ').replace(/\b[a-z](?=[a-z]{2})/g, function (letter) { return letter.toUpperCase(); });;
                        break;
                    }
                }
            }
        }

        this.updatePageTitle(pageTitle);
    }

    private updatePageTitle(pageTitle: string) {
        this.titleService.setTitle(pageTitle ? ('BackLiver | ' + pageTitle) : 'BackLive');
    }

    getLinkUrl(route: RouteInfo, params: {} = null, relativeToBase: boolean = false) {
        var cacheKey = route.path + JSON.stringify(params);
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
        var routeLink: any[] = [route.path];
        var optionalParams = {};
        var hasOptionalParams: boolean = false;

        if (params) {
            var linkParams = route.params || {};
            for (var key in params) {
                if (linkParams[key] === true) {
                    routeLink.push(params[key]);
                }
                else if (!Common.isDefined(linkParams[key])) {
                    //check if this a param embedded directly in path
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

    subscribeToBack(callback: Function) {
        this.backSubcriber = callback;
    }
    
    unsubscribeToBack() {
        this.backSubcriber = null;
    }

    subscribeToParams(componentId: number, callback: RouteParamsCallback) {
        this.paramsSubscribers[componentId] = callback;
    }

    unsubsribeToParams(componentId: number) {
        delete this.paramsSubscribers[componentId];
    }

    private updateParams(params: { [key: string]: any }) {
        for (var key in this.paramsSubscribers) {
            this.paramsSubscribers[key](params);
        }
    }

    subscribeToQueryParams(componentId: number, callback: RouteParamsCallback) {
        this.queryParamsSubscribers[componentId] = callback;
    }

    unsubsribeToQueryParams(componentId: number) {
        delete this.queryParamsSubscribers[componentId];
    }

    private updateQueryParams(params: { [key: string]: any }) {
        for (var key in this.queryParamsSubscribers) {
            this.queryParamsSubscribers[key](params);
        }
    }

    subscribeToUrl(subscriber: Function) {
        this.urlSubscribers.push(subscriber);
    }
 
    notifyUrlSubscribers(path: string, params: { [key: string]: any }) {
        setTimeout(() => {
            this.urlSubscribers.forEach(subscriber => subscriber(path, params));
        }, 1000);
    }

    subscribeToNavigationStart(callback: Function) {
        this.navigationStartSubcribers.push(callback);
    }

    notifyNavigationStartSubscribers() {
        this.navigationStartSubcribers.forEach(subscriber => subscriber());
    }
}

export interface RouteInfo {
    path: string;
    params?: { [key: string]: any }; //optional params that can be set when navigating to a route
}

export interface RouteParamsCallback {
    (params: { [key: string]: any });
}