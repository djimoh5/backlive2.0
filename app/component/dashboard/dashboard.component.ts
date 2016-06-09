import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent, SearchBarComponent} from 'backlive/component/shared';
import {ParseDatePipe} from 'backlive/pipe';
import {JIsotopeDirective} from 'backlive/directive';

import {AppService, UserService, StrategyService} from 'backlive/service';

import {StrategyComponent} from 'backlive/component/backtest';
import {TickerComponent} from 'backlive/component/portfolio';

import {AppEvent, Ticker, Strategy} from 'backlive/service/model';

@Component({
    selector: 'app-dashboard',
    templateUrl: Path.ComponentView('dashboard'),
    styleUrls: [Path.ComponentStyle('dashboard')],
    directives: [StrategyComponent, TickerComponent, JIsotopeDirective],
    pipes: [ParseDatePipe]
})
export class DashboardComponent extends PageComponent {
    strategyService: StrategyService;
    
    strategies: Strategy[];
    tickers: Ticker[];// = [{ name:'BAC', prices:[] }];
    
    constructor(appService: AppService, strategyService: StrategyService) {
        super(appService);
        
        this.strategyService = strategyService;
        this.strategyService.getBacktests().then((strategies: Strategy[]) => this.loadStrategies(strategies));
        
        var items = [
            { icon: "search", component: SearchBarComponent },
            { icon: "video", onClick: () => this.filterMenu(), tooltip:'test' },
            { icon: "list", onClick: () => this.filterMenu() },
            { icon: "settings", component: null }
        ];
        
        appService.notify(AppEvent.SlidingNavItems, items);
    }
    
    filterMenu() {
        
    }
    
    loadStrategies(strategies: Strategy[]) {
        console.log(strategies);
        this.strategies = strategies;
    }
}