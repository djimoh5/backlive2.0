import { Component, Input, Output, OnInit, AfterViewInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService, IndicatorService } from 'backlive/service';
import { Indicator, Node, IndicatorParam, IndicatorParamType, Operator } from 'backlive/service/model';

import { CloseFooterModalEvent } from 'backlive/event';

@Component({
    selector: 'backlive-indicator-editor',
    templateUrl: Path.ComponentView('indicator/editor'),
    styleUrls: [Path.ComponentStyle('indicator/editor')],
})
export class IndicatorEditorComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() indicator: Indicator;
    dataSearchKey: string;
    searchKey: string;
    searchKeyCode: SearchKeyCode;

    @ViewChild('searchBox') searchBox: ElementRef; //search input native element
      
    constructor(appService: AppService, private indicatorService: IndicatorService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.searchBox.nativeElement.focus();
        }, 1000);
    }

    onSelectParam(param: IndicatorParam) {
        setTimeout(() => {
            this.searchKey = this.dataSearchKey = '';

            if(this.indicator.vars.length > this.indicator.ops.length) {
                this.indicator.ops.push(Operator.Add);
            }

            this.indicator.vars.push(param);
            this.searchBox.nativeElement.focus();
        });
    }

    onSearchKey(event: KeyboardEvent) {
        var ops = [111,106,107,109,191,56,187,189];
        var keyCode = event.keyCode ? event.keyCode : event.which;

        if(keyCode === 13) {
            if(Common.isNumber(this.searchKey)) {
                this.onSelectParam([IndicatorParamType.Constant, parseFloat(this.searchKey)]);
                event.preventDefault();
            }
            else {
                this.searchKeyCode = { enter: true };
            }
        }
        else if(Common.inArray(keyCode, ops)) {
            if(this.indicator.vars.length > this.indicator.ops.length) {
                this.indicator.ops.push(this.keyToOperator(keyCode));
                this.searchKey = '';
                this.dataSearchKey = '';
                event.preventDefault();
            }
        }
        else if(keyCode === 8 && !this.searchKey) {
            var varsLen =  this.indicator.vars.length;

            if(varsLen > 0) {
                var opsLen = this.indicator.ops.length;

                if(opsLen >= varsLen) {
                    this.indicator.ops.splice(opsLen - 1, 1);
                }
                else {
                    this.indicator.vars.splice(varsLen - 1, 1);
                }
            }
        }
        else if(keyCode === 38) {
            this.searchKeyCode = { up: true };
        }
        else if(keyCode === 40) {
            this.searchKeyCode = { down: true };
        }
    }

    keyToOperator(keyCode: number) {
        switch(keyCode) {
			case 106: case 56: return Operator.Multiply;
			case 107: case 187: return Operator.Add;
			case 109: case 189: return Operator.Subtract;
            case 111: case 191: return Operator.Divide;
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

export interface SearchKeyCode {
    down?: boolean;
    up?: boolean;
    enter?: boolean;
}