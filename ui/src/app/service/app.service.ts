import { Injectable } from '@angular/core';
import { UserService } from './user.service';

import { RouteInfo, RouterService, RouteParamsCallback } from './router.service';
import { ClientSocket } from './client.socket';

import { Config } from 'backlive/config';
import { PlatformUI } from 'backlive/utility/ui';

import { EventQueue, BaseEvent, TypeOfBaseEvent, BaseEventCallback, QueueOperators } from 'backlive/network/event';
import { RouterLoadingEvent } from 'backlive/event';

@Injectable()
export class AppService {
    userService: UserService; //set by UserService to prevent circular reference
    
    private eventQueue: EventQueue;

    private componentLoaded: boolean; //denotes when at least one component has loaded after routing
    protected get ServiceComponentId() { return 'service'; }
    
    constructor(public routerService: RouterService, public clientSocket: ClientSocket, private platformUI: PlatformUI) {
        this.eventQueue = new EventQueue();

        this.clientSocket.on(Config.ServerEventQueueId, (event: BaseEvent<any>) => {
            console.log('web - from socket', event);
            this.notify(event, true);
        });

        this.routerService.subscribeToNavigationStart(() => {
            this.componentLoaded = false;
            this.notify(new RouterLoadingEvent(true));
        });

        this.routerService.subscribeToUrl(() => {
            this.notify(new RouterLoadingEvent(false));
        });
    }

    setComponentLoaded() {
        if (!this.componentLoaded) {
            this.componentLoaded = true;
            this.notify(new RouterLoadingEvent(false));
        }
    }
    
    navigate(route: RouteInfo, params: {} = null, event: MouseEvent = null, queryParams: {} = {}) {
        params = this.setAccountIdParam(params);
        this.routerService.navigate(route, params, event, queryParams);
        this.platformUI.scrollToTop();
    }

    open(route: RouteInfo, params: {} = null) {
        params = this.setAccountIdParam(params);
        this.routerService.open(route, params);
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

    unsubscribeToParams(componentId: number) {
        this.routerService.unsubsribeToParams(componentId);
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, componentId: number, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) {
        this.eventQueue.subscribe(eventType, componentId, callback, operators);
    }
    
    notify(event: BaseEvent<any>, fromServer: boolean = false) {
        this.eventQueue.notify(event);

        if(!fromServer && event.isSocketEvent) {
            this.clientSocket.emit(Config.ClientEventQueueId, event);
        }
    }
    
    unsubscribe(componentId: number, eventType?: typeof BaseEvent) {
        this.eventQueue.unsubscribe(componentId, eventType);
    }
}