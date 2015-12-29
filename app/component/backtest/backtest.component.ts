import {Component} from 'angular2/core';
import {Path} from '../../config/config';
import {PageComponent, AlertComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from '../../config/routes';
import {Event} from '../../service/model/event';

@Component({
    selector: 'backtest',
    templateUrl: Path.Component('backtest/backtest.component.html'),
    directives: []
})
export class BacktestComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}