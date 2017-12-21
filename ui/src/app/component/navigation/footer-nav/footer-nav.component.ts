import { Component, OnInit } from '@angular/core';

import { BaseComponent } from 'backlive/component/shared';

import { AppService, CryptoService } from 'backlive/service';
import { LastPrice, TradeSide, CryptoTicker, CryptoColor } from 'backlive/service/model';

import { TickerLastPriceEvent } from 'backlive/event';

import { Common } from 'backlive/utility';

@Component({
    selector: 'footer-nav',
    templateUrl: 'footer-nav.component.html',
    styleUrls: ['footer-nav.component.less']
})
export class FooterNavComponent extends BaseComponent implements OnInit {
    showStockTicker: boolean = true;
    showNews: boolean;

    static lastPrices: LastPrice[] = [];
    static isSubscribed: boolean;
    static coins: { [key: string]: LastPrice };
    lastPrices: LastPrice[];

    constructor (appService: AppService, private cryptoService: CryptoService) {
        super(appService);
        this.lastPrices = FooterNavComponent.lastPrices;
    }

    ngOnInit() {
        if(!FooterNavComponent.isSubscribed) {
            FooterNavComponent.coins = {
                'BTC-USD': { ticker: 'Bitcoin', price: 0, change: 0, percentChange: 0, color: CryptoColor.BTC },
                'BCH-USD': { ticker: 'Bitcoin Cash', price: 0, change: 0, percentChange: 0, color: CryptoColor.BCH },
                'ETH-USD': { ticker: 'Ethereum', price: 0, change: 0, percentChange: 0, color: CryptoColor.ETH },
                'LTC-USD': { ticker: 'Litecoin', price: 0, change: 0, percentChange: 0, color: CryptoColor.LTC },
            }

            for(var productId in FooterNavComponent.coins) {
                FooterNavComponent.lastPrices.push(FooterNavComponent.coins[productId]);
            }

            this.cryptoService.ticker.subscribe((data: CryptoTicker) => {
                var coin = FooterNavComponent.coins[data.product_id];
                if(coin) {
                    coin.price = parseFloat(data.price);
                    coin.side = data.side === 'buy' ? TradeSide.Buy : TradeSide.Sell;
                }
            });

            FooterNavComponent.isSubscribed = true;
        }
    }

    getPriceClass(coin: LastPrice) {
        return coin.side === TradeSide.Buy ? 'color-green' : 'color-red';
    }
}