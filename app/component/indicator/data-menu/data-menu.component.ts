import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService } from 'backlive/service';
import { Indicator } from 'backlive/service/model';

@Component({
    selector: 'backlive-indicator-data-menu',
    templateUrl: Path.ComponentView('indicator/data-menu'),
    styleUrls: [Path.ComponentStyle('indicator/data-menu')],
})
export class IndicatorDataMenuComponent extends BaseComponent implements OnInit {
    @Input() excludedTypes: number;
      
    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }
}