import { BaseController, Get, Post, Delete } from './base.controller';
import { LookupService } from '../service/lookup.service';

export class LookupController extends BaseController {
	constructor() {
		super({ lookupService: LookupService });
	}

	@Get('data/fields')
	dataFields(req, res) {
		res.services.lookupService.getDataFields().then(function (dataFields) {
			res.send(dataFields);
		});
	};
}