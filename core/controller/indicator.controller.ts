import { BaseController, Get, Post, Delete } from './base.controller';
import { IndicatorService } from '../service/indicator.service';

export class IndicatorController extends BaseController {
	constructor() {
		super({ indicatorService: IndicatorService });
	}

	@Post('')
	save(req, res) {
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