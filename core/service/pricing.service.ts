import { BaseService } from './base.service';
import { PricingRepository } from '../repository/pricing.repository';

import { ISession } from '../lib/session';

export class PricingService extends BaseService {
    pricingRepository: PricingRepository;

    constructor(session: ISession) {
        super(session, { pricingRepository: PricingRepository });
    }

    getPrices(date: number) {
        return this.pricingRepository.getByDate(date);
    }
}