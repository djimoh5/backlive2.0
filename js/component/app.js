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
var header_nav_1 = require('./header-nav');
var header_control_1 = require('./header-control');
var footer_nav_1 = require('./footer-nav');
var AppComponent = (function () {
    function AppComponent() {
        this.name = 'BackLive';
        this.test = function () { alert(1); };
    }
    AppComponent = __decorate([
        angular2_1.Component({
            selector: 'backlive-app'
        }),
        angular2_1.View({
            templateUrl: '/view/app.html',
            directives: [header_nav_1.HeaderNavComponent, header_control_1.HeaderControlComponent, footer_nav_1.FooterNavComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
})();
angular2_1.bootstrap(AppComponent);
//# sourceMappingURL=app.js.map