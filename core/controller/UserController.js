var BaseController = require("./BaseController.js");
var UserModel = require("../model/UserModel.js");

function UserController() {
	BaseController.call(this);

	this.register = function (req, res) {
		var model = new UserModel(req.body, function() {
			res.send('register');	
		});
	};

	this.login = function (req, res) {
		res.send('login');
	};

	this.logout = function (req, res) {
		res.send('logout');
	};
}

UserController.inherits(BaseController);
module.exports = UserController;