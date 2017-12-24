import { BaseService } from './base.service';
import { Session } from '../lib/session';

const Gdax = require('gdax');

export class CryptoService extends BaseService {
    private static rateLimitedRequests: number = 0;
    private static rateLimitPeriod: number = 350;
    
    constructor(session: Session) {
        super(session);
    }

    getProducts() {
        this.gdaxClient().getProducts((a,b,c,) => this.onResponse(a,b,c));
        return this.promise;
    }

    get24HourStats(productId: string) {
        this.rateLimit(this.gdaxClient(productId), 'getProduct24HrStats');
        return this.promise;
    }

    getOrderBook(productId: string) {
        this.rateLimit(this.gdaxClient(productId), 'getProductOrderBook', { level: 2 });
        return this.promise;
    }

    getHistoricalPrices(productId: string, granularity: number) {
        this.rateLimit(this.gdaxClient(productId), 'getProductHistoricRates', { granularity: granularity });
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

    private rateLimit(client: any, serviceMethod: string, params?: { [key: string]: any }) {
		setTimeout(() => {
            var callback = (error, response, data) => {
                CryptoService.rateLimitedRequests--;
                this.onResponse(error, response, data);
            };

            if(params) {
                client[serviceMethod](params, callback);
            }
            else {
                client[serviceMethod](callback);
            }
		}, CryptoService.rateLimitedRequests * CryptoService.rateLimitPeriod);

		console.log('rate limit wait time', CryptoService.rateLimitedRequests * CryptoService.rateLimitPeriod);
		CryptoService.rateLimitedRequests++;
	}
}