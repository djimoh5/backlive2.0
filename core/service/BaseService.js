var Q = require('q');

var BaseService = function(session) {
	var self = this;
    this.session = session;
	
	this.deferred = Q.defer();
	this.promise = this.deferred.promise;
	
	this.done = function(data) {
		self.deferred.resolve(data);
	}
}

module.exports = BaseService;