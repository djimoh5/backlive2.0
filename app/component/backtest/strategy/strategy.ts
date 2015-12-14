import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {Path} from '../../../config/config';
import {BaseComponent} from '../../../config/imports/shared';

import {AppService, UserService} from '../../../config/imports/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'app-strategy',
    templateUrl: Path.Component('dashboard/strategy/strategy.html'),
    directives: [CORE_DIRECTIVES]
})
export class StrategyComponent extends BaseComponent {
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}