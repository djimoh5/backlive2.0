import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/routes';

@Component({
    selector: 'backlive-research',
    templateUrl: Path.ComponentView('research')
})
export class ResearchComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}