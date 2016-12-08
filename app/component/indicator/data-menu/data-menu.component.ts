import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService, LookupService } from 'backlive/service';
import { Indicator, DataField } from 'backlive/service/model';

@Component({
    selector: 'backlive-indicator-data-menu',
    templateUrl: Path.ComponentView('indicator/data-menu'),
    styleUrls: [Path.ComponentStyle('indicator/data-menu')],
})
export class IndicatorDataMenuComponent extends BaseComponent implements OnInit {
    @Input() excludedTypes: number;
    dataFields: DataField[];
      
    constructor(appService: AppService, private lookupService: LookupService) {
        super(appService);
        this.lookupService.getDataFields().then(dataFields => {
            console.log(dataFields);
        });
    }
    
    ngOnInit() {
        
    }
}