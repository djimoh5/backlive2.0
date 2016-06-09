import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {AppEvent} from 'backlive/service/model';

@Component({
    selector: 'app-strategy',
    templateUrl: Path.ComponentView('backtest/strategy'),
    directives: []
})
export class StrategyComponent extends BaseComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}