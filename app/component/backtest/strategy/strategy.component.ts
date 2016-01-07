import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'app-strategy',
    templateUrl: Path.ComponentView('backtest/strategy'),
    directives: []
})
export class StrategyComponent extends BaseComponent {
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}