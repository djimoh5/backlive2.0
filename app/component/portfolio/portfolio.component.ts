import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/routes';

@Component({
    selector: 'backlive-portfolio',
    templateUrl: Path.ComponentView('portfolio'),
    styleUrls: [Path.ComponentStyle('portfolio')]
})
export class PortfolioComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}