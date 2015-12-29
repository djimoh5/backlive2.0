import {Component} from 'angular2/core';
import {Path} from '../../../config/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

@Component({
    selector: 'footer-nav',
    templateUrl: Path.Component('navigation/footer-nav/footer-nav.component.html')
})
export class FooterNavComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}