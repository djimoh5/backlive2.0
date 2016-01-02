import {Component} from 'angular2/core';
import {Path} from '../../config/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from '../../config/routes';
import {Event} from '../../service/model/event';

@Component({
    selector: 'backlive-research',
    templateUrl: Path.Component('research/research.component.html'),
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