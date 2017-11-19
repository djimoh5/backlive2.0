import { BaseRepository, Context } from './base.repository';
import { Database, Collection } from '../lib/database';

//import { Pricing } from '../service/model/ticker.model';

export class PricingRepository extends BaseRepository {
    protected pricingContext: Context;

    constructor() {
        super('tech');
    }

    getByTicker(ticker: string): Promise<{ date: number, price: number }[]> {
        /*var collection = Database.mongoPricing.collection(ticker.substring(0, 1));
        this.pricingContext = new Context(collection);

        return this.pricingContext.find({ ticker: ticker });*/
        return this.context.find({ ticker: ticker }, { date: 1, price: 1 });
    }

    getByDate(date: number) : Promise<{ ticker: string, price: number, mktcap: number }[]> {
        return this.context.find({ date: date }, { ticker: 1, price: 1, mktcap: 1 });
    }
}