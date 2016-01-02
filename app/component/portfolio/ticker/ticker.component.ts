import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

import {Event} from '../../../service/model/event';
import {Alert} from '../../../service/model/alert';

@Component({
    selector: 'backlive-ticker',
    templateUrl: Path.ComponentView('portfolio/ticker'),
    directives: []
})
export class TickerComponent extends BaseComponent {
    constructor(appService: AppService) {
        super(appService);
        //appService.notify(Event.Alert, new Alert("welcome to the visanow app!"));
    }
}