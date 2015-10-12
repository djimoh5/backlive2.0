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
var search_bar_1 = require('./search-bar');
var SlidingNavComponent = (function () {
    function SlidingNavComponent() {
        this.isActive = false;
    }
    SlidingNavComponent.prototype.showSideBar = function () {
        this.isActive = !this.isActive;
    };
    SlidingNavComponent = __decorate([
        angular2_1.Component({
            selector: 'sliding-nav'
        }),
        angular2_1.View({
            templateUrl: '/view/shared/sliding-nav.html',
            directives: [angular2_1.NgClass, search_bar_1.SearchBarComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], SlidingNavComponent);
    return SlidingNavComponent;
})();
exports.SlidingNavComponent = SlidingNavComponent;
//# sourceMappingURL=sliding-nav.js.map