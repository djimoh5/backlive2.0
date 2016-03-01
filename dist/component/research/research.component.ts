import {Component} from 'angular2/core';
import {Path} from '../../config/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from '../../config/routes';
import {AppEvent} from '../../service/model/app-event';

@Component({
    selector: 'backlive-research',
    template: `
      <div [class]="pageAnimation">
      	<h1>Research</h1>
      </div>
    `,
    directives: []
})
export class ResearchComponent extends PageComponent {
    userService: UserService;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
    }
}