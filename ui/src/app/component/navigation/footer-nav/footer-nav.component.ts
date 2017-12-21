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
            /*this.subscribeEvent(TickerLastPriceEvent, event => {
                FooterNavComponent.lastPrices.splice(0, FooterNavComponent.lastPrices.length);

                for(var key in event.data) {
                    var lastPrice = event.data[key];
                    lastPrice.ticker = lastPrice.ticker.replace('^', '');

                    switch(lastPrice.ticker) {
                        case 'GSPC': lastPrice.ticker = 'S&P 500'; break;
                        case 'DJX': lastPrice.ticker = 'Dow Jones'; lastPrice.price = Common.round(lastPrice.price * 100, 2); break;
                        case 'IXIC': lastPrice.ticker = 'Nasdaq'; break;
                    }

                    FooterNavComponent.lastPrices.push(lastPrice);
                }
            });*/

            FooterNavComponent.coins = {
                'BTC-USD': { ticker: 'Bitcoin', price: 0, change: 0, percentChange: 0, color: CryptoColor.BTC },
                'ETH-USD': { ticker: 'Ethereum', price: 0, change: 0, percentChange: 0, color: CryptoColor.ETH },
                'LTC-USD': { ticker: 'Litecoin', price: 0, change: 0, percentChange: 0, color: CryptoColor.LTC }
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