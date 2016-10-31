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
        console.log(msg);
        self.deferred.resolve({ success: 0, msg: msg });
    }
}

module.exports = BaseService;

Function.prototype.inherits = function (parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        //Normal Inheritance 
        var tmp = function () { };
        tmp.prototype = parentClassOrObject.prototype; //clone parent's prototype

        this.prototype = new tmp(); //new parentClassOrObject; if we used parent here instead of using clone, it would call constructor which we want to do in actual class to pass parameters
        this.prototype.constructor = this;
        this.prototype.parent = tmp.prototype; //parentClassOrObject.prototype;
    }
    else {
        //Pure Virtual Inheritance 
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};