import { Component, Input, OnInit } from '@angular/core';

import { BaseComponent } from 'backlive/component/shared';

import { AppService, TickerService } from 'backlive/service';

import { Price } from 'backlive/service/model';

@Component({
    selector: 'backlive-ticker',
    templateUrl: 'ticker.component.html',
    styleUrls: ['ticker.component.less']
})
export class TickerComponent extends BaseComponent implements OnInit {
    @Input() ticker: string;
    tickerService: TickerService;
    
    constructor(appService: AppService, tickerService: TickerService) {
        super(appService);
        this.tickerService = tickerService;
    }
    
    ngOnInit() {
        this.tickerService.getPrices(this.ticker).then((prices: Price[]) => this.loadPrices(prices));
        this.tickerService.getPrice(this.ticker, 20160115).then((price: Price) => this.loadPrice(price));
        this.tickerService.getPrice(this.ticker).then((price: Price) => this.loadPrice(price));
    }
    
    loadPrices(price: Price[]) {
        console.log(price);
    }
    
    loadPrice(price: Price) {
        console.log(price);
    }
}