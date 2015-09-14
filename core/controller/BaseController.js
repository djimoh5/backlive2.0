var express = require('express');

function BaseController() {
	var self = this,
		router = express.Router();
	
	// middleware specific to this router
	/*router.use(function timeLog(req, res, next) {
		console.log('Time: ', Date.now());
		next();
	});*/

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

	self.getRouter = function () {
		for(var key in self) {
			if(self.hasOwnProperty(key) && key != 'METHOD' && key != 'getRouter') {
				router.get('/' + (key == 'index' ? '' : key), self[key]);
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