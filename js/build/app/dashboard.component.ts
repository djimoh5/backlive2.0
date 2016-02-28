import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent, SearchBarComponent} from 'backlive/component/shared';
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
    template: `
      <div [class]="pageAnimation">
          <div *ngIf="strategies" class="strategies" [isotope]="'.strategy'" layoutMode="masonry">
              <div *ngFor="#strategy of strategies, #i = index" class="strategy col-md-2 col-sm-6 col-xs-12">
                  <div class="pod">
                      <h4 class="name">{{strategy.name}}</h4>
                      <h5 class="date">{{strategy.date | parseDate:'short'}}</h5>
                  </div>
              </div>
          </div>
          <div class="tickers">
              <backlive-ticker *ngFor="#ticker of tickers" [ticker]="ticker.name"></backlive-ticker>
          </div>
      </div>
    `,
    styles: [`
      .clearfix{*zoom:1}.clearfix:before,.clearfix:after{display:table;content:"";line-height:0}.clearfix:after{clear:both}.hide-text{font:0/0 a;color:transparent;text-shadow:none;background-color:transparent;border:0}.input-block-level{display:block;width:100%;min-height:30px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.pod{background:#FFF;border:1px #c8c8c8 solid;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;margin:0 0 20px 0;-webkit-box-shadow:2px 2px 2px rgba(0,0,0,0.09),-1px -1px 2px rgba(0,0,0,0.09);-moz-box-shadow:2px 2px 2px rgba(0,0,0,0.09),-1px -1px 2px rgba(0,0,0,0.09);box-shadow:2px 2px 2px rgba(0,0,0,0.09),-1px -1px 2px rgba(0,0,0,0.09)}.pod .hd{padding:15px 20px 15px 20px;border-bottom:1px #EEE solid}.pod .hd h5{padding:0;margin:0}.pod .bd{padding:15px}.strategies .strategy .pod{padding:2px 10px;cursor:pointer}.strategies .strategy .pod:hover{background:#aaa}.strategies .strategy .name{font-size:16px;font-weight:600}
    `],
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