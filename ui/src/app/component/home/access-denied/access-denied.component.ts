import {Component} from '@angular/core';
import {PageComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'access-denied',
    templateUrl: 'access-denied.component.html',
    styles: [`h3 { color: #fff; text-align: center; padding: 30px; }`]
})
export class AccessDeniedComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}