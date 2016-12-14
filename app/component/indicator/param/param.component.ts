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

    @Output() remove: EventEmitter<null> = new EventEmitter<null>();

    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }

    groupEquation() {

    }

    setAbsoluteValue() {

    }

    removeField() {
        this.remove.emit();
    }

    onRemove(index: number) {
        var paramGroup: IndicatorParamGroup = <IndicatorParamGroup> this.param;
        paramGroup.vars.splice(index, 1);

        if(paramGroup.ops[index - 1]) {
            paramGroup.ops.splice(index - 1, 1);
        }
    }
}