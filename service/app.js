var AppService = (function () {
    function AppService() {
        this.Events = {};
    }
    AppService.prototype.subscribe = function (name, callback) {
        if (!this.Events[name]) {
            this.Events[name] = [];
        }
        this.Events[name].push(callback);
    };
    AppService.prototype.notify = function (name, data) {
        if (data === void 0) { data = null; }
        if (this.Events[name]) {
            this.Events[name].forEach(function (callback) {
                callback(data);
            });
        }
    };
    return AppService;
})();
exports.AppService = AppService;
//# sourceMappingURL=app.js.map