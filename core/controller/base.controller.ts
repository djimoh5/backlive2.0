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
            //console.log('injected', services);
			res.services = {};
			for(var serviceIdentifier in services) {
				res.services[serviceIdentifier] = new services[serviceIdentifier](req.session);
			}
		}
		
        logRequest(req);
		next();
	}
    
    function logRequest(req) {
        if(req.originalUrl.indexOf('/api/') >= 0) {
            console.log(req.originalUrl);
            if(hasKeys(req.query)) {
                console.log('Query', req.query);
            }
            if(hasKeys(req.body)) {
                console.log('Body', req.body);
            }
            console.log('-------------------------------------');
        }
    }
    
    function hasKeys(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                return true;
            }
            
        }
    }
	
	router.use(bodyParser.json());
	router.use(bodyParser.urlencoded());
    router.use(queryParser);
	router.use(initSession);
	router.use(injectServices);
    
	this.post = {};
    this.delete = {};
	
	this.getRouter = function () {
		for(var key in self) {
			if(self.hasOwnProperty(key) && key != 'getRoutePath' && key != 'getRouter') {
                if(key == 'post') {
                    for(key in self.post) {
                        router.post(self.getRoutePath(key), self.post[key]);
                        console.log('- registering post route', key);
                    }
                }
				else if(key == 'delete') {
                    for(key in self.delete) {
                        router.delete(self.getRoutePath(key), self.delete[key]);
                        console.log('- registering delete route', key);
                    }
                }
				else {
					router.get(self.getRoutePath(key), self[key]);
                    console.log('- registering get route', key);
				}
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