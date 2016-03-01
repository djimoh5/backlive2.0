import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'access-denied',
    template: `
      <h4>This view requires authentication</h4>
    `
})
export class AccessDeniedComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService);
    }
}