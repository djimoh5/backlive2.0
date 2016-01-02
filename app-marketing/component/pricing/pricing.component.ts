import {Component} from 'angular2/core';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

@Component({
    selector: 'app-pricing',
    templateUrl: ''
})
export class PricingComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}