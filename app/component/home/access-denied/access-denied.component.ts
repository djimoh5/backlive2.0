import {Component} from 'angular2/core';
import {Path} from '../../../config/config';
import {PageComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'access-denied',
    templateUrl: Path.Component('home/access-denied/access-denied.component.html')
})
export class AccessDeniedComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}