import { Component } from '@angular/core';
import { Route } from 'backlive/routes';

import { AppService } from 'backlive/service';

@Component({
    selector: 'backlive-home',
    template: ``
})
export class HomeComponent {
    constructor(appService: AppService) {
        appService.navigate(Route.CryptoTrader);
    }
}