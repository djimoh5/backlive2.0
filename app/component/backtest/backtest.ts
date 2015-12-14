import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {PageComponent, AlertComponent} from '../../config/imports/shared';

import {AppService, UserService} from '../../config/imports/service';

import {Route} from '../../config/routes';
import {Event} from '../../service/model/event';

@Component({
    selector: 'backtest',
    templateUrl: '/view/backtest/backtest.html',
    directives: [CORE_DIRECTIVES]
})
export class BacktestComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}