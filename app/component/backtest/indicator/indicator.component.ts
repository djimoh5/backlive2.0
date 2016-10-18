import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {Common} from 'backlive/utility';

import {AppService, UserService} from 'backlive/service';
import {AppEvent, Indicator} from 'backlive/service/model';

@Component({
    selector: 'backlive-indicator',
    templateUrl: Path.ComponentView('backtest/indicator'),
    styleUrls: [Path.ComponentStyle('backtest/indicator')]
})
export class IndicatorComponent extends BaseComponent implements OnInit {
    compare: number = 2;
    level: number = 0;
    
    @Input() indicator: Indicator;
    @Input() isChild: boolean;
    
    @Output() remove: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() readOnlyChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() groupIndicator: EventEmitter<boolean> = new EventEmitter<boolean>();
      
    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
    }

    toggleReadOnly() {
        this.indicator.readonly = !this.indicator.readonly;
        this.toggleChildren(<Indicator[]> this.indicator.vars, this.indicator.readonly);
        this.readOnlyChange.emit(this.indicator.readonly);
    }
    
    toggleChildren(vars: Indicator[], toggleVal: boolean) {
        for(var i = vars.length - 1; i >= 0; i--) {
            vars[i].readonly = toggleVal;
            this.toggleChildren(<Indicator[]> vars[i].vars, toggleVal);
        }
    }
    
    onGroupIndicator() {
        this.groupIndicator.emit(true);
    }
    
    onRemove() {
        this.remove.emit(true);
    }
}