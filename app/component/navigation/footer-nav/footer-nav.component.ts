import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';
import { LastPrice } from 'backlive/service/model';

import { TickerLastPriceEvent } from 'backlive/event';

import { Common } from 'backlive/utility';

@Component({
    selector: 'footer-nav',
    templateUrl: Path.ComponentView('navigation/footer-nav'),
    styleUrls: [Path.ComponentStyle('navigation/footer-nav')]
})
export class FooterNavComponent extends BaseComponent implements OnInit {
    showStockTicker: boolean = true;
    showNews: boolean;
    lastPrices: LastPrice[];

    constructor (appService: AppService) {
        super(appService);
    }

    ngOnInit() {
        this.subscribeEvent(TickerLastPriceEvent, event => {
            console.log(event);
            this.lastPrices = [];

            for(var key in event.data) {
                var lastPrice = event.data[key];
                lastPrice.ticker = lastPrice.ticker.replace('^', '');

                switch(lastPrice.ticker) {
                    case 'GSPC': lastPrice.ticker = 'S&P 500'; break;
                    case 'DJX': lastPrice.ticker = 'Dow Jones'; lastPrice.price = Common.round(lastPrice.price * 100, 2); break;
                    case 'IXIC': lastPrice.ticker = 'Nasdaq'; break;
                }

                this.lastPrices.push(lastPrice)
            }
        });
    }
}