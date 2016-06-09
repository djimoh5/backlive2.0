import {Component} from '@angular/core';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

@Component({
    selector: 'app-terms',
    templateUrl: ''
})
export class TermsComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}