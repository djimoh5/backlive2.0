import { Database, Mongo, Collection } from '../lib/database';
import { BaseRepository, Operations, Context } from './base.repository';
var Q = require('q');

import { TickerCache } from '../service/model/ticker.model';

export class TickercRepository extends BaseRepository {
    constructor() {
        super('tickers_c');
    }

    getByDate(date: number) : Promise<TickerCache> {
        return this.context.findOne({ date: date });
    }
}