import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { BaseComponent } from 'backlive/component/shared';

import { AppService, CryptoService } from 'backlive/service';
import { LastPrice, TradeSide, CryptoTicker, CryptoColor } from 'backlive/service/model';
import { setTimeout } from 'timers';

@Component({
    selector: 'footer-nav',
    templateUrl: 'footer-nav.component.html',
    styleUrls: ['footer-nav.component.less']
})
export class FooterNavComponent extends BaseComponent implements OnInit {
    @Output() tickerClick: EventEmitter<any> = new EventEmitter<any>();
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
            FooterNavComponent.coins = {};
            FooterNavComponent.isSubscribed = true;

            this.cryptoService.getProducts().then(products => {
                products.data.forEach(product => {
                    FooterNavComponent.coins[product.id] = {
                        productId: product.id,
                        ticker: this.cryptoService.getProductName(product.id),
                        price: 0, change: 0, percentChange: 0, color: CryptoColor[product.ticker]
                    };

                    this.get24HourStats(product.id);
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

    get24HourStats(productId: string) {
        this.cryptoService.get24HourStats(productId).then(stats => {
            FooterNavComponent.coins[productId].open = parseFloat(stats.data.open);
        });
        
        setInterval(() => {
            this.cryptoService.get24HourStats(productId).then(stats => {
                FooterNavComponent.coins[productId].open = parseFloat(stats.data.open);
            });
        }, 3600000);
    }

    getPriceChange(price: LastPrice) {
        return (price.price - price.open) / price.open;
    }

    getPriceClass(coin: LastPrice) {
        return coin.side === TradeSide.Buy ? 'color-green' : 'color-red';
    }

    onTickerClick(price: LastPrice) {
        this.tickerClick.emit(price);
    }
}