import { Injectable, EventEmitter } from '@angular/core';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppService } from './app.service';

@Injectable()
export class CryptoService extends BaseService {
    private gdaxSocket: WebSocket;
    ticker: EventEmitter<{ ticker: string, price: number }> = new EventEmitter();

    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'crypto');

        this.gdaxSocket = new WebSocket("wss://ws-feed.gdax.com");
        this.gdaxSocket.onopen = () => {
            console.log("gdax socket connected");

            this.gdaxSend({
                "type": "subscribe",
                "channels": [{ "name": "ticker", "product_ids": ["BTC-USD", "ETH-USD", "LTC-USD"] }]
            });
        };
        this.gdaxSocket.onmessage = (evt) => { 
            this.processGdaxMessage(evt);
        };
        this.gdaxSocket.onclose = () => {
            console.log("gdax socket closed");
        }
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