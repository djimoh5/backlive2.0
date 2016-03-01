import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/routes';
import {AppEvent} from '../../service/model/app-event';

@Component({
    selector: 'backlive-portfolio',
    template: `
      <div [class]="pageAnimation">
      	<h1>Portfolio</h1>
      </div>
    `,
    directives: []
})
export class PortfolioComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}