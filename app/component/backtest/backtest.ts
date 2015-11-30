import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {PageComponent} from '../shared/page';
import {AlertComponent} from '../shared/alert';

import {AppService} from '../../service/app';
import {UserService} from '../../service/user';

import {Route} from '../../config/routes';
import {Event} from '../../model/event';

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