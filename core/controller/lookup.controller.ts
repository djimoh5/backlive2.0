import { BaseController, Get, Request, Response } from './base.controller';
import { LookupService } from '../service/lookup.service';

export class LookupController extends BaseController {
	constructor() {
		super({ lookupService: LookupService });
	}

	@Get('data/fields')
	dataFields(req: Request, res: Response) {
		(<LookupService>res.services.lookupService).getDataFields().then(function (dataFields) {
			res.send(dataFields);
		});
	};
}