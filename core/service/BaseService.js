var Q = require('q');

var BaseService = function(session) {
    this.session = session;
	
	this.deferred = Q.defer();
	this.promise = this.deferred.promise;
	
	this.done = function(data) {
		this.deferred.resolve(data);
	}
}

module.exports = BaseService;