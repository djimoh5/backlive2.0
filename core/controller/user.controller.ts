import { BaseController, Get, Post, Response, Request } from './base.controller';
import { UserService } from '../service/user.service';

export class UserController extends BaseController {
	constructor() {
		super({ userService: UserService });
	}
	
	@Get('')
	user(req: Request, res) {
		res.send(req.session.user);
	}

	@Post('register')
	register(req: Request, res: Response) {
		(<UserService>res.services.userService).register(req.body.username, req.body.password, req.body.email).then(function(user) {
			res.send(user);	
		});
	};

	@Post('login')
	login(req: Request, res: Response) {
		(<UserService>res.services.userService).login(req.body.username, req.body.password).then(function(user) {
			res.send(user);
		});
	};

	@Get('logout')
	logout(req: Request, res: Response) {
		(<UserService>res.services.userService).logout();
		res.send({ success: 1 });
	};
}