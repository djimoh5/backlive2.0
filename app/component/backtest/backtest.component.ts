import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/routes';
import {AppEvent} from 'backlive/service/model';

@Component({
    selector: 'app-backtest',
    templateUrl: Path.ComponentView('backtest'),
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