import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService } from 'backlive/service';
import { IndicatorParam, IndicatorParamGroup } from 'backlive/service/model';

@Component({
    selector: 'backlive-indicator-param',
    templateUrl: Path.ComponentView('indicator/param'),
    styleUrls: [Path.ComponentStyle('indicator/param')],
})
export class  IndicatorParamComponent extends BaseComponent implements OnInit {
    @Input() isRoot: boolean;
    @Input() param: (IndicatorParam | IndicatorParamGroup);

    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }
}