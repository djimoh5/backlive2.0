import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {PageComponent, AlertComponent} from '../../config/imports/shared';

import {AppService, UserService} from '../../config/imports/service';

import {StrategyComponent} from '../backtest/strategy/strategy';
import {TickerComponent} from '../shared/ticker/ticker';

import {Event} from '../../service/model/event';
import {Alert} from '../../service/model/alert';

@Component({
    selector: 'app-dashboard',
    templateUrl: '/view/dashboard/dashboard.html',
    directives: [CORE_DIRECTIVES]
})
export class DashboardComponent extends PageComponent {
    stategies: StrategyComponent[];
    tickers: TickerComponent[];
    
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}