import { Injectable, EventEmitter } from '@angular/core';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppService } from './app.service';

import { ApiResponse } from './model/base.model';
import { CryptoTicker, CryptoProduct, CryptoOrderBook, CryptoPrices, Crypto24HrStats } from './model/crypto.model';

@Injectable()
export class CryptoService extends BaseService {
    private gdaxSocket: WebSocket;

    defaultProductId: string = 'BTC-USD';
    ticker: EventEmitter<CryptoTicker> = new EventEmitter<CryptoTicker>();

    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'crypto');
        
        this.getProducts().then(products => {
            this.gdaxSocket = new WebSocket("wss://ws-feed.gdax.com");
            this.gdaxSocket.onopen = () => {
                console.log("gdax socket connected");
    
                this.gdaxSend({
                    "type": "subscribe",
                    "channels": [{ "name": "ticker", "product_ids": products.data.map(p => { return p.id; }) }]
                });
            };
            this.gdaxSocket.onmessage = (evt) => { 
                this.processGdaxMessage(evt);
            };
            this.gdaxSocket.onclose = () => {
                console.log("gdax socket closed");
            };
        });

        
    }

    getProducts(): Promise<ApiResponse<CryptoProduct[]>> {
        return this.get('products', null, true, { expiration: 84600 }).then((products: ApiResponse<CryptoProduct[]>) => {
            if(products.success) {
                products.data = products.data.filter(p => {
                    if(p.id.indexOf('-USD') > 0) {
                        p.ticker = p.id.replace('-USD', '');
                        return true;
                    }

                    return false;
                }).sort((a, b) => {
                    if (a.id === this.defaultProductId) {
                        return -1;
                    }
                    else if (b.id === this.defaultProductId) {
                        return 1;
                    }
                    else {
                        return (a <= b ? -1 : 1);
                    }
                });
            }

            return products;
        });
    }

    get24HourStats(productId: string): Promise<ApiResponse<Crypto24HrStats>> {
        return this.get(`${productId}/stats`);
    }

    getOrderBook(productId: string): Promise<ApiResponse<CryptoOrderBook>> {
        return this.get(`${productId}/order-book`);
    }

    getPrices(productId: string, granularity: number): Promise<ApiResponse<CryptoPrices>> {
        return this.get(`${productId}/prices`, { granularity: granularity });
    }

    private productName = {
        'BTC-USD': 'Bitcoin',
        'BCH-USD': 'Bitcoin Cash',
        'ETH-USD': 'Ethereum',
        'LTC-USD': 'Litecoin'
    };
    getProductName(productId: string) {
        return this.productName[productId] ? this.productName[productId] : productId.replace('-USD', '');
    }

    private gdaxSend(json: any) {
        this.gdaxSocket.send(JSON.stringify(json));
    }

    private processGdaxMessage(msg: any) {
        //console.log(msg);
        var data = JSON.parse(msg.data);
        if(data.type === 'ticker') {
            this.ticker.emit(data);
        }
    }
}