import {Component} from 'angular2/angular2';
import {BaseComponent} from '../../../config/imports/shared';

import {AppService} from '../../../config/imports/service';

@Component({
    selector: 'footer-nav',
    templateUrl: '/view/navigation/footer-nav.html'
})
export class FooterNavComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}