import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {BaseComponent} from '../../../config/imports/shared';

import {AppService} from '../../../config/imports/service';

import {Event} from '../../../service/model/event';
import {Alert} from '../../../service/model/alert';

@Component({
    selector: 'app-ticker',
    templateUrl: '/view/dashboard/ticker.html',
    directives: [CORE_DIRECTIVES]
})
export class TickerComponent extends BaseComponent {
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}