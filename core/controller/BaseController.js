var DIR_ROOT = './../.';
var express = require('express');
var bodyParser = require('body-parser');

function BaseController(services) {
	var self = this,
		router = express.Router();
	
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
	
	self.post = {};
	
	self.getRouter = function () {
		for(var key in self) {
			if(self.hasOwnProperty(key) && key != 'METHOD' && key != 'getRouter' && key != 'post') {
				if(self.post[key]) {
					router.post('/' + (key == 'index' ? '' : key), self[key]);
				}
				else {
					router.get('/' + (key == 'index' ? '' : key), self[key]);
				}
				
				console.log('- registering route', key);
			}
		}
		
		return router;
	}

	self.METHOD = {
		GET: "GET",
		POST: "POST"
	}
}

BaseController.prototype = {

}

module.exports = BaseController;