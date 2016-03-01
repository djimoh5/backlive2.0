import {Component, bind, ViewEncapsulation, ElementRef, Attribute} from 'angular2/core';
import {ClientMessageBrokerFactory, PRIMITIVE, UiArguments, FnArg} from 'angular2/platform/worker_app';

import {Location, RouteConfig, RouterOutlet, ROUTER_DIRECTIVES} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Path} from 'backlive/config';

import {DashboardComponent} from './dashboard/dashboard.component';
import {RouteComponentMap} from 'backlive/routes';

/* services */
import {AppService, PopupAlert, RouterService, AuthRouterOutlet, ApiService, UserService} from 'backlive/service';

/* components */
import {BaseComponent, ModalComponent} from 'backlive/component/shared';
import {HeaderNavComponent, SlidingNavComponent, FooterNavComponent} from 'backlive/component/navigation';

/* models */
import {AppEvent, User} from 'backlive/service/model';

RouterService.setRouteMap(RouteComponentMap);

@Component({
    selector: 'backlive-app',
    template: `
      <header class="clearfix">
      	<header-nav></header-nav>
      </header>
      <div id="mainContainer">
          <div class="main clearfix" [class.nav-visible]="isSlidingNavVisible">
              <chart></chart>
              <router-outlet></router-outlet>
          </div>
          <sliding-nav [class.hidden]="!isSlidingNavVisible"></sliding-nav>
      </div>
      <footer>
      	<footer-nav></footer-nav>
      </footer>
    `,
    directives:[RouterOutlet, /*HeaderNavComponent,*/ SlidingNavComponent, FooterNavComponent/*, ModalComponent*/]
})
@RouteConfig([
    { name: 'Dashboard', path: '/', component: DashboardComponent }
])
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