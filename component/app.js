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
var angular2_1 = require('angular2/angular2');
var router_1 = require('angular2/router');
var app_1 = require('../service/app');
var header_nav_1 = require('./shared/header-nav');
var header_control_1 = require('./shared/header-control');
var sliding_nav_1 = require('./shared/sliding-nav');
var footer_nav_1 = require('./shared/footer-nav');
var research_1 = require('./research/research');
var backtest_1 = require('./backtest/backtest');
var portfolio_1 = require('./portfolio/portfolio');
var AppComponent = (function () {
    function AppComponent(router, location, app) {
        this.app = app;
        this.router = router;
        this.location = location;
        console.log(this.location.path());
        app.subscribe("alert", function () {
            console.log(4);
        });
    }
    AppComponent = __decorate([
        angular2_1.Component({
            selector: 'backlive-app',
            services: []
        }),
        angular2_1.View({
            templateUrl: '/view/app.html',
            directives: [router_1.ROUTER_DIRECTIVES, header_nav_1.HeaderNavComponent, header_control_1.HeaderControlComponent, sliding_nav_1.SlidingNavComponent, footer_nav_1.FooterNavComponent],
        }),
        router_1.RouteConfig([
            { path: '/', component: research_1.ResearchComponent, as: 'research' },
            { path: '/backtest', component: backtest_1.BacktestComponent, as: 'backtest' },
            { path: '/portfolio', component: portfolio_1.PortfolioComponent, as: 'portfolio' }
        ]), 
        __metadata('design:paramtypes', [router_1.Router, router_1.Location, app_1.AppService])
    ], AppComponent);
    return AppComponent;
})();
exports.AppComponent = AppComponent;
angular2_1.bootstrap(AppComponent, [app_1.AppService, router_1.ROUTER_BINDINGS, angular2_1.bind(router_1.LocationStrategy).toClass(router_1.HashLocationStrategy)]);
//# sourceMappingURL=app.js.map