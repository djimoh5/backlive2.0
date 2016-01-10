import {Component, Input, OnInit} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, TickerService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';
import {Ticker, Price} from '../../../service/model/ticker';

@Component({
    selector: 'backlive-ticker',
    templateUrl: Path.ComponentView('portfolio/ticker'),
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
        this.tickerService.getPrices(this.ticker).then((prices: Price[]) => this.loadPrices(prices))
    }
    
    loadPrices(price: Price[]) {
        console.log(price);
    }
}