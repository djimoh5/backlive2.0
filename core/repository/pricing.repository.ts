import { Database, Mongo, Collection } from '../lib/database';
import { BaseRepository, Operations, Context } from './base.repository';
var Q = require('q');

//import { Pricing } from '../service/model/ticker.model';

export class PricingRepository extends BaseRepository {
    constructor() {
        super('snt');
    }

    getByDate(date: number) : Promise<{ ticker: string, price: number, mktcap: number }[]> {
        return this.context.find({ date: date }, { ticker: 1, price: 1, mktcap: 1 });
    }
}