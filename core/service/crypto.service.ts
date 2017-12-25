import { BaseService, RateLimiter } from './base.service';
import { Session } from '../lib/session';

const Gdax = require('gdax');

export class CryptoService extends BaseService {
    constructor(session: Session) {
        super(session);
    }

    getProducts() {
        this.rateLimit(this.gdaxClient(), 'getProducts');
        return this.promise;
    }

    get24HourStats(productId: string) {
        this.rateLimit(this.gdaxClient(productId), 'getProduct24HrStats');
        return this.promise;
    }

    getOrderBook(productId: string) {
        console.log('order book', productId)
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
                RateLimiter.requestCount--;
                this.onResponse(error, response, data);
            };

            if(params) {
                client[serviceMethod](params, callback);
            }
            else {
                client[serviceMethod](callback);
            }
		}, RateLimiter.requestCount * RateLimiter.period);

		console.log('rate limit wait time', RateLimiter.requestCount * RateLimiter.period);
		RateLimiter.requestCount++;
	}
}