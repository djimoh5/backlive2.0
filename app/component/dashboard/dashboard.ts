import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {PageComponent} from '../shared/page';
import {AppService} from '../../service/app-service';

import {StrategyComponent} from './strategy';
import {TickerComponent} from './ticker';

import {Event} from '../../model/event';
import {Alert} from '../../model/alert';

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