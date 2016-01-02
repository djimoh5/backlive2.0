import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

@Component({
    selector: 'footer-nav',
    templateUrl: Path.ComponentView('navigation/footer-nav')
})
export class FooterNavComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}