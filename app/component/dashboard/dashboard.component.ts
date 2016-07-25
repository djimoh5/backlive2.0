import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent, SearchBarComponent} from 'backlive/component/shared';
import {ParseDatePipe} from 'backlive/pipe';
import {JIsotopeDirective} from 'backlive/directive';

import {AppService, UserService, StrategyService} from 'backlive/service';

import {StrategyComponent} from 'backlive/component/backtest';
import {TickerComponent} from 'backlive/component/portfolio';

import {AppEvent, Ticker, Strategy, Performance} from 'backlive/service/model';

@Component({
    selector: 'app-dashboard',
    templateUrl: Path.ComponentView('dashboard'),
    styleUrls: [Path.ComponentStyle('dashboard')],
    directives: [StrategyComponent, TickerComponent, JIsotopeDirective],
    pipes: [ParseDatePipe]
})
export class DashboardComponent extends PageComponent {
    strategyService: StrategyService;
    
    liveStrategies: Strategy[];
    strategies: Strategy[];
    stratsById: {[key: string]: Strategy};
    tickers: Ticker[];// = [{ name:'BAC', prices:[] }];
    
    iso: any;
    
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
        this.liveStrategies = [];
        this.strategies = [];
        this.stratsById = {};
        
        strategies.forEach(strategy => {
            this.stratsById[strategy._id] = strategy;
            
            if(strategy.live) {
                this.liveStrategies.push(strategy);
            }
            else {
                this.strategies.push(strategy);
            }
        });
        
        console.log(this.liveStrategies, this.strategies);
        this.getReturns();
    }
    
    getReturns() {
        this.strategyService.getReturns(this.liveStrategies.map(strategy => { return strategy._id; }), 20160101, 20170101).then(res => {
            var strats = res.data;
            console.log(strats);
            for(var id in strats) {
                var lastIndex = strats[id].returns.length - 1;
                this.stratsById[strats[id].bt_id].results = new Performance(
                    strats[id].returns[0].capital,
                    strats[id].returns[lastIndex].capital,
                    strats[id].returns[0].date,
                    strats[id].returns[lastIndex].date
                );
            }
            
            setTimeout(() => {
                this.iso.resize();
            }, 1000);
        });
    }
    
    onIsotopeLoaded(iso: any) {
        this.iso = iso;
        console.log(iso);
    }
}