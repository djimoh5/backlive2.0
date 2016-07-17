import {Component} from '@angular/core';
import {Route} from 'backlive/routes';

import {AppService, UserService} from 'backlive/service';
import {AppEvent} from 'backlive/service/model';

@Component({
    selector: 'vn-home',
    template: ``
})
export class HomeComponent {
    constructor(appService: AppService, userService: UserService) {
        appService.navigate(Route.Dashboard);
    }
}