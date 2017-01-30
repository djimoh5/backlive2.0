import { BaseRepository } from './base.repository';

//import { Pricing } from '../service/model/ticker.model';

export class PricingRepository extends BaseRepository {
    constructor() {
        super('snt');
    }

    getByDate(date: number) : Promise<{ ticker: string, price: number, mktcap: number }[]> {
        return this.context.find({ date: date }, { ticker: 1, price: 1, mktcap: 1 });
    }
}