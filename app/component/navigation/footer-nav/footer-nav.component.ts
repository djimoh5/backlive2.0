import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';

import { TickerLastPriceEvent } from 'backlive/event';

@Component({
    selector: 'footer-nav',
    templateUrl: Path.ComponentView('navigation/footer-nav')
})
export class FooterNavComponent extends BaseComponent implements OnInit {
    constructor (appService: AppService) {
        super(appService);
    }

    ngOnInit() {
        this.subscribeEvent(TickerLastPriceEvent, event => {
            console.log(event);
            
            for(var key in event.data) {
                event.data[key].percentChange;
            }
        });
    }
}