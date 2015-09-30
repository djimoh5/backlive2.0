/// <reference path="../js/typings/angular2/angular2.d.ts" />
/// <reference path="../js/typings/angular2/router.d.ts" />
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var angular2_1 = require('angular2/angular2');
var router_1 = require('angular2/router');
var header_nav_js_1 = require('./shared/header-nav.js');
var header_control_js_1 = require('./shared/header-control.js');
var footer_nav_js_1 = require('./shared/footer-nav.js');
var research_js_1 = require('./research/research.js');
var backtest_js_1 = require('./backtest/backtest.js');
var portfolio_js_1 = require('./portfolio/portfolio.js');
var AppComponent = (function () {
    function AppComponent(router, location, research) {
        this.router = router;
        this.location = location;
        this.events = {};
        console.log(this.location.path());
    }
    AppComponent.prototype.subscribe = function (name, callback) {
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(callback);
    };
    AppComponent.prototype.notify = function (name, data) {
        if (this.events[name]) {
            this.events[name].forEach(function (callback) {
                callback();
            });
        }
    };
    AppComponent = __decorate([
        angular2_1.Component({
            selector: 'backlive-app'
        }),
        angular2_1.View({
            templateUrl: '/view/app.html',
            directives: [router_1.ROUTER_DIRECTIVES, header_nav_js_1.HeaderNavComponent, header_control_js_1.HeaderControlComponent, footer_nav_js_1.FooterNavComponent]
        }),
        router_1.RouteConfig([
            { path: '/', component: research_js_1.ResearchComponent, as: 'research' },
            { path: '/backtest', component: backtest_js_1.BacktestComponent, as: 'backtest' },
            { path: '/portfolio', component: portfolio_js_1.PortfolioComponent, as: 'portfolio' }
        ]),
        __param(2, angular2_1.Inject(research_js_1.ResearchComponent)), 
        __metadata('design:paramtypes', [router_1.Router, router_1.Location, (typeof ResearchComponent !== 'undefined' && ResearchComponent) || Object])
    ], AppComponent);
    return AppComponent;
})();
angular2_1.bootstrap(AppComponent, [research_js_1.ResearchComponent, router_1.ROUTER_BINDINGS, angular2_1.bind(router_1.LocationStrategy).toClass(router_1.HashLocationStrategy)]);
//# sourceMappingURL=app.js.map