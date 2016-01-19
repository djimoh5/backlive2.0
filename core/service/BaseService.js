var Q = require('q');

var BaseService = function(session) {
	var self = this;
    this.session = session;
	
	this.deferred = Q.defer();
	this.promise = this.deferred.promise;
	
	this.done = function(data) {
		self.deferred.resolve(data);
	}
    
    this.success = function(data) {
		self.deferred.resolve({ success: 1, data: data });
	}
    
    this.error = function(msg) {
        self.deferred.resolve({ success: 0, msg: msg });
    }
}

module.exports = BaseService;