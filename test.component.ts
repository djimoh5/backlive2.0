import {Component, bind, ViewEncapsulation, ElementRef, Attribute} from '@angular/core';
import {ClientMessageBrokerFactory, PRIMITIVE, UiArguments, FnArg} from '@angular/platform/worker_app';

import {RouteConfig, RouterOutlet, ROUTER_DIRECTIVES} from '@angular/router';
import {HTTP_PROVIDERS} from '@angular/http';
import {Path} from 'backlive/config';

import {DashboardComponent} from './dashboard/dashboard.component';
import {Route} from 'backlive/routes';

/* services */
import {AppService, PopupAlert, RouterService, AuthRouterOutlet, ApiService, UserService} from 'backlive/service';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';
import {HeaderNavComponent, SlidingNavComponent, FooterNavComponent} from 'backlive/component/navigation';

/* models */
import {AppEvent, User} from 'backlive/service/model';

@Component({
    selector: 'backlive-app',
    templateUrl: 'app/component/app.component.html',
    directives:[RouterOutlet, /*HeaderNavComponent,*/ SlidingNavComponent, FooterNavComponent/*, ModalComponent*/]
})
@RouteConfig(RouterService.AppRoutes(Route))
export class AppComponent {
    constructor(brokerFactory: ClientMessageBrokerFactory, appService: AppService) {
        var broker = brokerFactory.createMessageBroker("channel1");

        var args = [new FnArg('#test', PRIMITIVE)];
        var methodInfo = new UiArguments("hide", args);
        broker.runOnService(methodInfo, PRIMITIVE).then((result: string) => {
            console.log(result)
        });
    }
}