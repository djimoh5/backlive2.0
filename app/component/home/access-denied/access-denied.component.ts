import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'access-denied',
    templateUrl: Path.ComponentView('home/access-denied')
})
export class AccessDeniedComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}