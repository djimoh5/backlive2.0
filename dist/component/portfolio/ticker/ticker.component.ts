import {Component, Input, OnInit} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, TickerService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';
import {Ticker, Price} from '../../../service/model/ticker';

@Component({
    selector: 'backlive-ticker',
    template: `

    `,
    directives: []
})
export class TickerComponent extends BaseComponent implements OnInit {
    @Input() ticker;
    tickerService: TickerService;
    
    constructor(appService: AppService, tickerService: TickerService) {
        super(appService);
        this.tickerService = tickerService;
    }
    
    ngOnInit() {
        this.tickerService.getPrices(this.ticker).then((prices: Price[]) => this.loadPrices(prices));
        this.tickerService.getPrice(this.ticker, 20160115).then((price: Price) => this.loadPrice(price));
        this.tickerService.getPrice(this.ticker).then((price: Price) => this.loadPrice(price))
    }
    
    loadPrices(price: Price[]) {
        console.log(price);
    }
    
    loadPrice(price: Price) {
        console.log(price);
    }
}