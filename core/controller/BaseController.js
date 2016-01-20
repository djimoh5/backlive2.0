var DIR_ROOT = './../.';
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');

function BaseController(services) {
	var self = this,
		router = express.Router();
	
    function queryParser(req, res, next) {
        req.query = url.parse(req.url, true).query;
        next();
    }
    
	function initSession(req, res, next) {
		req.session = new Session(req, res);
		next();
	}
	
	function injectServices(req, res, next) {
		if(services) {
			res.services = {};
			//console.log(req.session)
			for(var serviceIdentifier in services) {
				res.services[serviceIdentifier] = new services[serviceIdentifier](req.session);
			}
		}
		
		next();
	}
	
	router.use(bodyParser.json());
	router.use(bodyParser.urlencoded());
    router.use(queryParser);
	router.use(initSession);
	router.use(injectServices);

	/*self.action = function (path, callback, method) {
		switch (method) {
			case self.METHOD.POST:
				router.post(path, callback);
				break;
			default:
				router.get(path, callback);
				break;
		}
	}*/
	
	this.post = {};
    this.delete = {};
	
	this.getRouter = function () {
		for(var key in self) {
			if(self.hasOwnProperty(key) && key != 'getRoutePath' && key != 'getRouter') {
                if(key == 'post') {
                    for(key in self.post) {
                        router.post(self.getRoutePath(key), self.post[key]);
                    }
                }
				else if(key == 'delete') {
                    for(key in self.delete) {
                        router.delete(self.getRoutePath(key), self.delete[key]);
                    }
                }
				else {
					router.get(self.getRoutePath(key), self[key]);
				}
				
				console.log('- registering route', key);
			}
		}
		
		return router;
	}
    
    this.getRoutePath = function(key) {
        return '/' + (key == 'index' ? '' : key.toLowerCase());
    }
}

BaseController.prototype = {

}

module.exports = BaseController;