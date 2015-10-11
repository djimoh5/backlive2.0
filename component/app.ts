import { Component, View, bootstrap, bind, Inject, Injectable, ViewEncapsulation } from 'angular2/angular2';
import { Location, Router, RouteConfig, ROUTER_BINDINGS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy } from 'angular2/router';

import {AppService} from '../service/app';

import {HeaderNavComponent} from './shared/header-nav';
import {HeaderControlComponent} from './shared/header-control';
import {SlidingNavComponent} from './shared/sliding-nav';
import {FooterNavComponent} from './shared/footer-nav';

import {ResearchComponent} from './research/research';
import {BacktestComponent} from './backtest/backtest';
import {PortfolioComponent} from './portfolio/portfolio';

@Component({
    selector: 'backlive-app',
    services: []
})
@View({
    templateUrl: '/view/app.html',
    directives: [ROUTER_DIRECTIVES, HeaderNavComponent, HeaderControlComponent, SlidingNavComponent, FooterNavComponent],
    /*encapsulation: ViewEncapsulation.Native*/
})
@RouteConfig([
  { path: '/', component: ResearchComponent, as: 'research' },
  { path: '/backtest', component: BacktestComponent, as: 'backtest' },
  { path: '/portfolio', component: PortfolioComponent, as: 'portfolio' }
])
export class AppComponent {
    app: AppService;
    router: Router;
    location: Location;
    
    constructor(router: Router, location: Location, app: AppService) {
        this.app = app;
        this.router = router;
        this.location = location;
        
        console.log(this.location.path());
        app.subscribe("alert", function() {
            console.log(4);
        });
    }
}

bootstrap(AppComponent, [AppService, ROUTER_BINDINGS, bind(LocationStrategy).toClass(HashLocationStrategy)]);