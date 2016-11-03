import { BaseController, Get } from './base.controller';
import { Config } from '../config';
var path = require("path");

export class HomeController extends BaseController {
	@Get('')
	index(req, res) {
		var baseDir = path.resolve(__dirname, '../../');

		if(req.session.user && req.session.user.token) {
			res.sendFile(baseDir + '/view/page.html');
		}
		else {
			res.sendFile(baseDir + '/home/index.html');
		}
	}
}