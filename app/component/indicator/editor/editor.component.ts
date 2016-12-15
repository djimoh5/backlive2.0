import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService, IndicatorService } from 'backlive/service';
import { Indicator, Node, IndicatorParam, Operator } from 'backlive/service/model';

import { IndicatorChangeEvent } from '../indicator.event';
import { CloseFooterModalEvent } from 'backlive/event';

@Component({
    selector: 'backlive-indicator-editor',
    templateUrl: Path.ComponentView('indicator/editor'),
    styleUrls: [Path.ComponentStyle('indicator/editor')],
})
export class IndicatorEditorComponent extends BaseComponent implements OnInit {
    @Input() indicator: Indicator;
    dataSearchKey: string;
    searchKey: string;
      
    constructor(appService: AppService, private indicatorService: IndicatorService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }

    onSelectParam(param: IndicatorParam) {
        this.searchKey = this.dataSearchKey = '';
        this.indicator.vars.push(param);

        if(this.indicator.vars.length > 1) {
            this.indicator.ops.push(Operator.Add);
        }
    }

    hasParams() {
        return this.indicator.vars.length > 0;
    }

    closeEditor() {
        //indicator gets auto-saved on close
        this.appService.notify(new CloseFooterModalEvent(null));
    }

    clearEquation() {
        this.indicator.vars = [];
        this.indicator.ops = [];
    }
}