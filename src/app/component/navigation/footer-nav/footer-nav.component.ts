import { Component, OnInit } from '@angular/core';

import { BaseComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';
import { LastPrice } from 'backlive/service/model';

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
    lastPrices: LastPrice[];

    constructor (appService: AppService) {
        super(appService);
        this.lastPrices = FooterNavComponent.lastPrices;
    }

    ngOnInit() {
        if(!FooterNavComponent.isSubscribed) {
            this.subscribeEvent(TickerLastPriceEvent, event => {
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
            });

            FooterNavComponent.isSubscribed = true;
        }
    }
}