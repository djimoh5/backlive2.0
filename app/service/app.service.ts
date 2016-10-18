import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {UserService} from './user.service';
import {AppEvent} from './model/app-event.model';

import {RouteInfo, RouterService, RouteParamsCallback} from './router.service';

import {Config} from 'backlive/config';
import {Common, Cache} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

export class PopupAlert {
    message: string;
    buttons: string[];
}

@Injectable()
export class AppService {
    userService: UserService; //set by UserService to prevent circular reference
    
    Events: { [key: string]: { [key: string]: Function[] } };
    private componentLoaded: boolean; //denotes when at least one component has loaded after routing
    applicationState: ApplicationState;

    protected get ServiceComponentId() { return 'service' };
    
    constructor(public routerService: RouterService, private platformUI: PlatformUI) {
        this.Events = {};

        this.routerService.subscribeToNavigationStart(() => {
            this.componentLoaded = false;
            this.notify(AppEvent.RouterLoading, true);
        });

        this.routerService.subscribeToUrl(() => {
            this.notify(AppEvent.RouterLoading, false);
        });
    }

    setComponentLoaded() {
        if (!this.componentLoaded) {
            this.componentLoaded = true;
            this.notify(AppEvent.RouterLoading, false);
        }
    }
    
    navigate(route: RouteInfo, params: {} = null, event: MouseEvent = null, queryParams: {} = {}) {
        params = this.setAccountIdParam(params);
        this.routerService.navigate(route, params, event, queryParams);
        this.platformUI.scrollToTop();
    }

    open(route: RouteInfo, params: {} = null, queryParams: {} = {}) {
        params = this.setAccountIdParam(params);
        this.routerService.open(route, params);
    }

    navigateExternal(route: RouteInfo, params: {} = null, event: MouseEvent = null) {
        this.platformUI.reload(this.routerService.getLinkUrl(route, params, true), event);
    }

    openExternal(route: RouteInfo, params: {} = null) {
        this.platformUI.open(this.routerService.getLinkUrl(route, params, true));
    }

    getLinkUrl(route: RouteInfo, params: {} = null, relativeToBase: boolean = false) {
        params = this.setAccountIdParam(params);
        return this.routerService.getLinkUrl(route, params, relativeToBase);
    }

    private setAccountIdParam(params: {} = null) {
        params = params ? params : {};
        params[Config.AccountRouteKey] = this.userService.user.username;
        return params;
    }

    subscribeToParams(componentId: number, callback: RouteParamsCallback) {
        this.routerService.subscribeToParams(componentId, callback);
    }

    subscribe(eventName: string, componentId: any, callback: Function) {
        if (!this.Events[eventName]) {
            this.Events[eventName] = {};
        }
        
        if(!this.Events[eventName][componentId]) {
            this.Events[eventName][componentId] = [];
        }

        this.Events[eventName][componentId].push(callback);
    }

    unsubscribeToParams(componentId: number) {
        this.routerService.unsubsribeToParams(componentId);
    }
    
    unsubscribe(componentId: any, eventName?: string) {
        if(eventName && this.Events[eventName] && this.Events[eventName][componentId]) {
            delete this.Events[eventName][componentId];
        }
        else {
            for(var name in this.Events) {
                if(this.Events[name][componentId]) {
                    delete this.Events[name][componentId];
                }
            }
        }
    }

    notify<T>(eventName: string, data: T = null) {
        if (this.Events[eventName]) {
            setTimeout(() => {
                var cnt = 0;
                
                //notify any services first
                if(this.Events[eventName][this.ServiceComponentId]) {
                    this.notifyComponent<T>(this.ServiceComponentId, eventName, data);
                }
                
                for(var componentId in this.Events[eventName]) {
                    if(componentId != this.ServiceComponentId) {
                        this.notifyComponent<T>(componentId, eventName, data);
                    }
                    
                    cnt++;
                }
                
                if(cnt == 0) {
                    Common.log('EVENT: ' + eventName + ' has no subscribers');
                }
                else {
                    //Common.log('EVENT: ' + eventName + ' fired to ' + cnt + ' subscribers with data', data);
                }
            });
        }
        else {
            Common.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }
    
    private notifyComponent<T>(componentId: any, eventName: string, data: T = null) {
        this.Events[eventName][componentId].forEach((callback: Function) => {
            callback(data); 
        });
    }
    
    clearEvent(eventName: string) {
        if (this.Events[eventName]) {
            delete this.Events[eventName];
        }
    }
}

export interface ApplicationState {
    case: Case;
    applicant: Applicant;
}