import { BaseController, Get, Post, Delete } from './base.controller';
import { NodeController } from './node.controller';
import { IndicatorService } from '../service/indicator.service';

import { Indicator } from '../service/model/indicator.model';

export class IndicatorController extends NodeController<Indicator> {
	constructor() {
		super(IndicatorService);
	}
}