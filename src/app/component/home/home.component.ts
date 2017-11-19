import {Component} from '@angular/core';
import {Route} from 'backlive/routes';

import {AppService, UserService} from 'backlive/service';

@Component({
    selector: 'backlive-home',
    template: ``
})
export class HomeComponent {
    constructor(appService: AppService, userService: UserService) {
        appService.navigate(Route.Dashboard);
    }
}