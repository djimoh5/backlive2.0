import {Component} from 'angular2/angular2';
import {Path} from '../../../config/config';
import {PageComponent} from '../../../config/imports/shared';
import {AppService} from '../../../config/imports/service';

@Component({
    selector: 'access-denied',
    templateUrl: Path.Component('home/access-denied/access-denied.component.html')
})
export class AccessDeniedComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}