import { Component, Input, OnInit } from '@angular/core';

import { NodeComponent } from 'backlive/component/shared';
import { IndicatorEditorComponent } from './editor/editor.component';

import { AppService, IndicatorService } from 'backlive/service';
import { Indicator } from 'backlive/service/model';

import { OpenFooterModalEvent } from 'backlive/event';

import { Common } from 'backlive/utility';

@Component({
    selector: 'backlive-indicator',
    templateUrl: 'indicator.component.html',
    styleUrls: ['indicator.component.less'],
    outputs: NodeComponent.outputs //inherited, workaround until angular fix
})
export class IndicatorComponent extends NodeComponent<Indicator> implements OnInit {
    @Input() indicator: Indicator;
    isEditing: boolean;
      
    constructor(appService: AppService, private indicatorService: IndicatorService) {
        super(appService, indicatorService);
    }
    
    ngOnInit() {
        if(!this.indicator._id) {
            this.update();
            this.onEdit();
        }

        this.init(this.indicator);
    }

    update() {
        this.indicatorService.update(this.indicator).then(indicator => {
            if(indicator._id) {
                this.indicator._id = indicator._id;
                this.nodeChange.emit(this.indicator);
            }
        });
    }

    onEdit() {
        this.appService.notify(new OpenFooterModalEvent({ 
            title: 'Edit Indicator',
            body: IndicatorEditorComponent,
            nameEditor: { model: this.indicator, field: 'name' },
            model: {
                indicator: this.indicator
            },
            onModalClose: () => {
                this.inputToNumber(this.indicator, 'excl1');
                this.inputToNumber(this.indicator, 'excl2');
                this.inputToNumber(this.indicator, 'exclOp1');
                this.inputToNumber(this.indicator, 'exclOp2');
                this.update();
            }
        }));
    }

    inputToNumber(obj: any, field: string, defaultValue: number = null) {
        if(Common.isNumber(obj[field])) { 
            obj[field] = parseInt(obj[field]);
        }
        else {
            obj[field] = defaultValue;
        }
    }
}