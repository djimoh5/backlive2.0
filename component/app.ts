/// <reference path="../js/typings/angular2/angular2.d.ts" />
/// <reference path="../js/typings/angular2/router.d.ts" />

import { Component, View, bootstrap, bind, Inject, Injectable } from 'angular2/angular2';
import { Location, Router, RouteConfig, ROUTER_BINDINGS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy } from 'angular2/router';

import {HeaderNavComponent} from './shared/header-nav.js';
import {HeaderControlComponent} from './shared/header-control.js';
import {FooterNavComponent} from './shared/footer-nav.js';
import {ResearchComponent} from './research/research.js';
import {BacktestComponent} from './backtest/backtest.js';
import {PortfolioComponent} from './portfolio/portfolio.js';

@Component({
    selector: 'backlive-app'
})
@View({
    templateUrl: '/view/app.html',
    directives: [ROUTER_DIRECTIVES, HeaderNavComponent, HeaderControlComponent, FooterNavComponent]
})
@RouteConfig([
  { path: '/', component: ResearchComponent, as: 'research' },
  { path: '/backtest', component: BacktestComponent, as: 'backtest' },
  { path: '/portfolio', component: PortfolioComponent, as: 'portfolio' }
])
class AppComponent {
    router: Router;
    location: Location;
    events: Object;
    
    constructor(router: Router, location: Location, @Inject(ResearchComponent) research: ResearchComponent) {
        this.router = router;
        this.location = location;
        this.events = {};

        console.log(this.location.path());
    }
    
    subscribe(name, callback) {
        if(!this.events[name]) {
            this.events[name] = [];
        }
        
        this.events[name].push(callback);
    }
    
    notify(name, data) {
        if(this.events[name]) {
            this.events[name].forEach(callback => {
                callback();
            });
        }
    }
}

bootstrap(AppComponent, [ResearchComponent, ROUTER_BINDINGS, bind(LocationStrategy).toClass(HashLocationStrategy)]);