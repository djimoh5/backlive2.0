import { BaseController, Get, Post, Delete } from './base.controller';
var IndicatorService = require("../service/IndicatorService.js");

export class IndicatorController extends BaseController {
	constructor() {
		super({ indicatorService: IndicatorService });
	}

	@Post()
	index(req, res) {
		res.services.indicatorService.saveIndicator(res.body.indicator).done(function(res) {
			res.send(res);
		});
	}

	@Delete(':indicatorId')
	removeIndicator(req, res) {
		res.services.indicatorService.removeIndicator(req.params.indicatorId).done(function(res) {
			res.send(res);
		});
	}
}