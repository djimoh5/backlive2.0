import { BaseController, Get, Post, Delete } from './base.controller';
import { UserService } from '../service/user.service';

export class UserController extends BaseController {
	constructor() {
		super({ userService: UserService });
	}
	
	@Get('')
	user(req, res) {
		res.send(req.session.user);
	}

	@Post('register')
	register(req, res) {
		res.services.userService.register(req.body).done(function(user) {
			res.send(user);	
		});
	};

	@Post('login')
	login(req, res) {
		res.services.userService.login(req.body).done(function(user) {
			res.send(user);
		});
	};

	@Get('logout')
	logout(req, res) {
		res.services.userService.logout().done(function(data) {
			res.send(data);	
		});
	};
}