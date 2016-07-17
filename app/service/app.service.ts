import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {UserService} from './user.service';
import {AppEvent} from './model/app-event.model';

import {RouteInfo, RouterService} from './router.service';

import {Config} from 'backlive/config';
import {Common, Cache} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

export class PopupAlert {
    message: string;
    buttons: string[];
}

@Injectable()
export class AppService extends BaseService {
    userService: UserService; //set by app component
    routerService: RouterService;
    platformUI: PlatformUI;
    
    Events: { [key: string]: { [key: string]: Function[] } };
    
    constructor(apiService: ApiService, routerService: RouterService, platformUI: PlatformUI) {
        super(apiService, null, null);
        this.routerService = routerService;
        this.platformUI = platformUI;
        
        this.Events = {};
    }
    
    navigate(route: RouteInfo, params: {} = null, event: MouseEvent = null, queryParams: {} = {}) {
        route.params = params ? params : {};
        //route.params[Config.AccountIdRouteKey] = this.userService.user.accountNumber.toLowerCase();

        this.routerService.navigate(route, event, queryParams);
        this.platformUI.scrollToTop();
    }

    subscribeToParams(componentId: number, callback: Function) {
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