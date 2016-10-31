import { BaseController, Get } from './base.controller';
import { Config } from '../config';

export class HomeController extends BaseController {
	@Get()
	index(req, res) {
		if(req.session.user && req.session.user.token) {
			res.sendFile(Config.DIR_VIEW + 'page.html');
		}
		else {
			res.sendFile(Config.DIR_HOME + 'index.html');
		}
	}
}