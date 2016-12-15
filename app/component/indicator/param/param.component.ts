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

    groupEquation() {
        console.log('group', this.param, this.isGrouping);
        if(this.isGrouping) {
            this.fieldClicked();
            return;
        }

        this.isGrouping = true;
        this.group.emit(true);
    }

    onGroup(index: number, grouping: boolean) {
        this.isGrouping = grouping;
        this.groupStartIndex = grouping ? index : null;
    }

    fieldClicked() {
        console.log('remove group', this.param, this.isGrouping);
        if(this.isGrouping) {
            this.isGrouping = false;
            this.groupStartIndex = null;
            this.group.emit(false);
            return;
        }

        this.fieldClick.emit();
    }

    onClick(index: number) {
        if(this.isGrouping) {
            var paramGroup: IndicatorParamGroup = <IndicatorParamGroup> this.param;
            var start = this.groupStartIndex > index ? index : this.groupStartIndex;
            var end = this.groupStartIndex < index ? index : this.groupStartIndex;

            var vars = paramGroup.vars.splice(start, end - start + 1);
            var ops = paramGroup.ops.splice(start, end - start);
            paramGroup.vars.splice(start, 0, { vars: vars, ops: ops });
        }
    }

    removeField() {
        this.remove.emit();
    }

    onRemove(index: number) {
        var paramGroup: IndicatorParamGroup = <IndicatorParamGroup> this.param;
        paramGroup.vars.splice(index, 1);

        if(index === 0) {
            index = 1; //set to 1 so op in fron gets removed
        }
        
        if(paramGroup.ops[index - 1]) {
            paramGroup.ops.splice(index - 1, 1);
        }
    }
}