import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'access-denied',
    templateUrl: Path.ComponentView('home/access-deniedl')
})
export class AccessDeniedComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}