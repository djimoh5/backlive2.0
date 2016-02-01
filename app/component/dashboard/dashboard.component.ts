import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';
import {ParseDate} from 'backlive/pipe';
import {JIsotope} from 'backlive/directive';

import {AppService, UserService, StrategyService} from 'backlive/service';

import {StrategyComponent} from 'backlive/component/backtest';
import {TickerComponent} from 'backlive/component/portfolio';

import {AppEvent} from '../../service/model/app-event';
import {Ticker} from '../../service/model/ticker';
import {Strategy} from '../../service/model/strategy';

@Component({
    selector: 'app-dashboard',
    templateUrl: Path.ComponentView('dashboard'),
    styleUrls: [Path.ComponentStyle('dashboard')],
    directives: [StrategyComponent, TickerComponent, JIsotope],
    pipes: [ParseDate]
})
export class DashboardComponent extends PageComponent {
    strategyService: StrategyService;
    
    strategies: Strategy[];
    tickers: Ticker[];// = [{ name:'BAC', prices:[] }];
    
    constructor(appService: AppService, strategyService: StrategyService) {
        super(appService);
        
        this.strategyService = strategyService;
        this.strategyService.getBacktests().then((strategies: Strategy[]) => this.loadStrategies(strategies));
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
    
    loadStrategies(strategies: Strategy[]) {
        console.log(strategies);
        this.strategies = strategies;
    }
}