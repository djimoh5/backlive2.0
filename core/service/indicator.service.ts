import { BaseService } from './base.service';
import { IndicatorRepository } from '../repository/indicator.repository';

import { NodeService } from './node.service';
import { Session } from '../lib/session';

import { Indicator } from './model/indicator.model';

export class IndicatorService  extends NodeService<Indicator> {
    indicatorRepository: IndicatorRepository;

    constructor(session: Session) {
        super(session, IndicatorRepository);
        this.indicatorRepository = this.nodeRepository;
    }
}