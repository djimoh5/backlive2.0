import { Component, OnInit } from '@angular/core';

import { BaseComponent } from 'backlive/component/shared';

import { AppService, CryptoService } from 'backlive/service';
import { LastPrice, TradeSide, CryptoTicker, CryptoColor } from 'backlive/service/model';

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

    productNameMap = {
        'BTC-USD': 'Bitcoin',
        'BCH-USD': 'Bitcoin Cash',
        'ETH-USD': 'Ethereum',
        'LTC-USD': 'Litecoin'
    };

    constructor (appService: AppService, private cryptoService: CryptoService) {
        super(appService);
        this.lastPrices = FooterNavComponent.lastPrices;
    }

    ngOnInit() {
        if(!FooterNavComponent.isSubscribed) {
            FooterNavComponent.coins = {};
            FooterNavComponent.isSubscribed = true;

            this.cryptoService.getProducts().then(products => {
                products.data.forEach(product => {
                    FooterNavComponent.coins[product.id] = {
                        ticker: this.productNameMap[product.id] ? this.productNameMap[product.id] : product.ticker,
                        price: 0, change: 0, percentChange: 0, color: CryptoColor[product.ticker]
                    };
                });
    
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
            });
        }
    }

    getPriceClass(coin: LastPrice) {
        return coin.side === TradeSide.Buy ? 'color-green' : 'color-red';
    }
}