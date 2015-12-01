var BaseController = require("./BaseController.js");

function HomeController() {
	BaseController.call(this);
	
	this.index = function(req, res) {
		if(req.session.user) {
			res.sendFile(DIR_VIEW + 'page.html');
		}
		else {
			res.sendFile(DIR_VIEW + 'marketing/page.html');
		}
	}
}

HomeController.inherits(BaseController);
module.exports = HomeController;