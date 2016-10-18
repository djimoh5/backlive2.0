import {Component} from '@angular/core';
import {Path} from 'backlive/config';

import {PageComponent, SearchBarComponent} from 'backlive/component/shared';
import {RadioButtonOption} from 'backlive/component/shared/ui';

import {AppService, UserService, StrategyService} from 'backlive/service';

import {Common} from 'backlive/utility';

import {AppEvent, Ticker, Strategy, Performance} from 'backlive/service/model';

@Component({
    selector: 'backlive-dashboard',
    templateUrl: Path.ComponentView('dashboard'),
    styleUrls: [Path.ComponentStyle('dashboard')]
})
export class DashboardComponent extends PageComponent {
    strategyService: StrategyService;
    
    liveStrategies: Strategy[];
    strategies: Strategy[];
    stratsById: {[key: string]: Strategy};
    tickers: Ticker[];// = [{ name:'BAC', prices:[] }];
    
    iso: any;
    dateOptions: RadioButtonOption[];
    currentDateOption: number = 0;
    customStartDate: number;
    customEndDate: number;
    
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
        
        this.dateOptions = [
          { title: '1d', value: 1 },
          { title: '5d', value: 5 },
          { title: '1m', value: 30 },
          { title: '3m', value: 90 },
          { title: '6m', value: 182 },
          { title: 'YTD', value: 0 },
          { title: '1yr', value: 365 },
          { title: '5yr', value: 1825 },
          { title: '10yr', value: 3650 },
          { title: 'Custom', value: -1 },
        ];
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
        
        console.log(JSON.stringify(this.liveStrategies[0]));
        console.log(this.liveStrategies, this.strategies);
        this.onDateChange(this.currentDateOption);
    }
    
    getReturns(startDate: number, endDate: number) {
        console.log(startDate, endDate);
        
        this.strategyService.getReturns(this.liveStrategies.map(strategy => { return strategy._id; }), startDate, endDate).then(res => {
            var strats = res.data;
            console.log(strats);
            
            for(var id in this.stratsById) {
                this.stratsById[id].results = null;
            }

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
                if(this.iso) {
                    this.iso.layout();
                }
            });
        });
    }
    
    onDateChange(value: number) {
        if(value === -1) {
            return
        }
        
        var today = new Date();
        var startDate: number;
        var endDate: number = Common.dbDate(today);
        
        if(value > 0) {
            today.setDate(today.getDate() - value);
            startDate = Common.dbDate(today);
        }
        else if(value === 0) {
           startDate = parseInt(today.getFullYear() + '0101');
        }
        
        this.getReturns(startDate, endDate);
    }
    
    onCustomDateChange() {
        if(this.customStartDate && this.customEndDate) {
            this.getReturns(this.customStartDate, this.customEndDate);
        }
    }
    
    onIsotopeLoaded(iso: any) {
        this.iso = iso;
        this.iso.layout();
    }
}