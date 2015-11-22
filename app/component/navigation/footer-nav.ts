import {Component} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';

@Component({
    selector: 'footer-nav',
    templateUrl: '/view/navigation/footer-nav.html'
})
export class FooterNavComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}