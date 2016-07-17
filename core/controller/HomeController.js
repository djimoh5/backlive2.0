var BaseController = require("./BaseController.js");

function HomeController() {
	BaseController.call(this);
	
	this.index = function(req, res) {
		if(req.session.user && req.session.user.token) {
			res.sendFile(DIR_VIEW + 'page.html');
		}
		else {
			res.sendFile(DIR_HOME + 'index.html');
		}
	}
}

HomeController.inherits(BaseController);
module.exports = HomeController;