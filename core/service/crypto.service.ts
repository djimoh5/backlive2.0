import { BaseService } from './base.service';
import { Session } from '../lib/session';

const Gdax = require('gdax');

export class CryptoService extends BaseService {
    constructor(session: Session) {
        super(session);
    }

    getProducts() {
        this.gdaxClient().getProducts((error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    get24HourStats(productId: string) {
        this.gdaxClient(productId).getProduct24HrStats((error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    getOrderBook(productId: string) {
        this.gdaxClient(productId).getProductOrderBook({ level: 2 }, (error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    getHistoricalPrices(productId: string, granularity: number) {
        this.gdaxClient(productId).getProductHistoricRates({ granularity: granularity }, (error, response, data) => this.onResponse(error, response, data));
        return this.promise;
    }

    private gdaxClient(productId?: string) {
       return new Gdax.PublicClient(productId);
    }

    private onResponse(error, response, data) {
        if (error) {
            this.error(error);
        } else {
            this.success(data);
        }
    } 
}