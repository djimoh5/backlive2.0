import { BaseController, Get } from './base.controller';

var path = require("path");

export class HomeController extends BaseController {
	@Get('')
	index(req, res) {
		var baseDir = path.resolve(__dirname, '../../ui/');

		if(req.session.user && req.session.user.token) {
			res.sendFile(baseDir + '/dist/index.html');
		}
		else {
			res.sendFile(baseDir + '/src/home/index.html');
		}
	}
}