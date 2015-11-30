import {Component} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';

@Component({
    selector: 'app-pricing',
    templateUrl: ''
})
export class PricingComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}