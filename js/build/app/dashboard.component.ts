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
      @import "/css/plugins/mixins.less";
      @import "/css/theme/colors.less";

      .strategies {

      }
      .strategy .pod {
          padding: 2px 10px;
          cursor: pointer;
      }
      .strategy .name {
          font-size: 16px;
          font-weight: 600;
      }
      .strategy .pod:hover {
          background: #aaa;
      }
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