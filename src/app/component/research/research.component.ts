import {Component} from '@angular/core';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

@Component({
    selector: 'backlive-research',
    templateUrl: 'research.component.html'
})
export class ResearchComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}