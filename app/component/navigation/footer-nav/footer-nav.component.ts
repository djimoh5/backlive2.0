import {Component} from 'angular2/angular2';
import {Path} from '../../../config/config';
import {BaseComponent} from '../../../config/imports/shared';

import {AppService} from '../../../config/imports/service';

@Component({
    selector: 'footer-nav',
    templateUrl: Path.Component('navigation/footer-nav/footer-nav.component.html')
})
export class FooterNavComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}