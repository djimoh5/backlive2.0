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
    @Output() group: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() fieldClick: EventEmitter<null> = new EventEmitter<null>();

    isGrouping: boolean;
    groupStartIndex: number;

    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }

    setAbsoluteValue() {

    }

    //current param
    groupEquation() {
        if(this.isGrouping) {
            this.fieldClicked(); //undo start group
        }
        else {
            this.isGrouping = true;
            this.group.emit(true);
        }
    }

    //parent param
    onGroup(index: number, grouping: boolean) {
        if(this.isGrouping && grouping) {
            this.onClick(index);
        }
        else {
            this.isGrouping = grouping;
            this.groupStartIndex = grouping ? index : null;
        }
    }

    //current param
    fieldClicked() {
        if(this.isGrouping) {
            this.isGrouping = false;
            this.group.emit(false);
        }
        else {
            this.fieldClick.emit();
        }
    }

    //parent param
    onClick(index: number) {
        if(this.isGrouping) {
            var paramGroup: IndicatorParamGroup = <IndicatorParamGroup> this.param;
            var start = this.groupStartIndex > index ? index : this.groupStartIndex;
            var end = this.groupStartIndex < index ? index : this.groupStartIndex;

            var vars = paramGroup.vars.splice(start, end - start + 1);
            var ops = paramGroup.ops.splice(start, end - start);
            paramGroup.vars.splice(start, 0, { vars: vars, ops: ops });

            this.resetGrouping();
        }
    }

    //current param
    removeField() {
        this.remove.emit();
    }

    //parent param
    onRemove(index: number) {
        var paramGroup: IndicatorParamGroup = <IndicatorParamGroup> this.param;
        paramGroup.vars.splice(index, 1);

        var opIndex: number = index === 0 ? 0 : (index - 1);
        if(paramGroup.ops[opIndex]) {
            paramGroup.ops.splice(opIndex, 1);
        }

        if(index === this.groupStartIndex) {
            this.resetGrouping();
        }

        if(paramGroup.vars.length === 0) {
            this.remove.emit();
        }
    }

    resetGrouping() {
        this.isGrouping = false;
        this.groupStartIndex = null;
    }
}