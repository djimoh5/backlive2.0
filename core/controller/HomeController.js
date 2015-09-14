var BaseController = require("./BaseController.js");

function HomeController() {
	BaseController.call(this);
	
	this.index = function(req, res) {
		res.sendfile(DIR_VIEW + 'page.html');
	}
}

HomeController.inherits(BaseController);
module.exports = HomeController;