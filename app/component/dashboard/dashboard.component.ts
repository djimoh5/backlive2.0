import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {StrategyComponent} from 'backlive/component/backtest';
import {TickerComponent} from 'backlive/component/portfolio';

import {AppEvent} from '../../service/model/app-event';
import {Ticker} from '../../service/model/ticker';
import {Strategy} from '../../service/model/strategy';

@Component({
    selector: 'app-dashboard',
    templateUrl: Path.ComponentView('dashboard'),
    directives: [StrategyComponent, TickerComponent]
})
export class DashboardComponent extends PageComponent {
    stategies: Strategy[];
    tickers: Ticker[];
    
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}