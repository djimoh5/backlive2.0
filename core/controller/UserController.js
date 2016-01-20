var BaseController = require("./BaseController.js");
var UserService = require("../service/UserService.js");

function UserController() {
	BaseController.call(this, { userService: UserService });

	this.index = function (req, res) {
		res.send(req.session.user);
	}
	
	this.post.register = function (req, res) {
		res.services.userService.register(req.body).done(function(user) {
			res.send(user);	
		});
	};

	this.post.login = function (req, res) {
		res.services.userService.login(req.body).done(function(user) {
			res.send(user);
		});
	};

	this.logout = function (req, res) {
		res.services.userService.logout().done(function(data) {
			res.send(data);	
		});
	};
}

UserController.inherits(BaseController);
module.exports = UserController;