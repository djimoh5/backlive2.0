import { Component, OnInit } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';

@Component({
    selector: 'crypto-order',
    templateUrl: 'crypto-order.component.html',
    styleUrls: ['crypto-order.component.less']
})
export class CryptoOrderComponent extends PageComponent implements OnInit {
    constructor(appService: AppService) {
        super(appService);
    }

    ngOnInit() {
       
    }
}