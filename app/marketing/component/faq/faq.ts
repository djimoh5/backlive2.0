import {Component} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';

@Component({
    selector: 'app-faq',
    templateUrl: ''
})
export class FaqComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}