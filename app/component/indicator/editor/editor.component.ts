import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService, IndicatorService } from 'backlive/service';
import { Indicator, Node, IndicatorParam, Operator } from 'backlive/service/model';

import { IndicatorChangeEvent } from '../indicator.event';

@Component({
    selector: 'backlive-indicator-editor',
    templateUrl: Path.ComponentView('indicator/editor'),
    styleUrls: [Path.ComponentStyle('indicator/editor')],
})
export class IndicatorEditorComponent extends BaseComponent implements OnInit {
    @Input() indicator: Indicator;
    searchKey: string;
    showDataMenu: boolean;
      
    constructor(appService: AppService, private indicatorService: IndicatorService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }

    onSelectParam(param: IndicatorParam) {
        this.indicator.vars.push(param);

        if(this.indicator.vars.length > 1) {
            this.indicator.ops.push(Operator.Add);
        }
    }
}