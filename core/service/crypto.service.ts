import { BaseService } from './base.service';
import { Session } from '../lib/session';

const Gdax = require('gdax');

export class CryptoService extends BaseService {
    publicClient = new Gdax.PublicClient();

    constructor(session: Session) {
        super(session);
    }

    getProducts() {
        this.publicClient.getProducts((error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    get24HourStats(productId: string) {
        this.publicClient.getProduct24HrStats({ productID: productId }, (error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    getOrderBook(productId: string) {
        this.publicClient.getProductOrderBook({ productID: productId, level: 2 }, (error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    getHistoricalPrices(productId: string, granularity: number) {
        this.publicClient.getProductHistoricRates({ productID: productId, granularity: granularity }, (error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    private onResponse(error, response, data) {
        if (error) {
            this.error(error);
        } else {
            this.success(data);
        }
    } 
}