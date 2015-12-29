import {Component} from 'angular2/core';
import {Path} from '../../config/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {StrategyComponent} from 'backlive/component/backtest';
import {TickerComponent} from 'backlive/component/portfolio';

import {Event} from '../../service/model/event';
import {Alert} from '../../service/model/alert';

@Component({
    selector: 'app-dashboard',
    templateUrl: Path.Component('dashboard/dashboard.component.html'),
    directives: []
})
export class DashboardComponent extends PageComponent {
    stategies: StrategyComponent[];
    tickers: TickerComponent[];
    
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}