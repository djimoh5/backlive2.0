import { BaseController, Get, Post } from './base.controller';
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
		res.services.userService.register(req.body.username, req.body.password, req.body.email).done(function(user) {
			res.send(user);	
		});
	};

	@Post('login')
	login(req, res) {
		res.services.userService.login(req.body.username, req.body.password).done(function(user) {
			res.send(user);
		});
	};

	@Get('logout')
	logout(req, res) {
		res.services.userService.logout();
		res.send({ success: 1 });
	};
}