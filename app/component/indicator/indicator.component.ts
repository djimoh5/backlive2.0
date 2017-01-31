import { Component, Input, OnInit } from '@angular/core';
import { Path } from 'backlive/config';
import { NodeComponent } from 'backlive/component/shared';
import { IndicatorEditorComponent } from './editor/editor.component';

import { AppService, IndicatorService } from 'backlive/service';
import { Indicator } from 'backlive/service/model';

import { OpenFooterModalEvent } from 'backlive/event';

@Component({
    selector: 'backlive-indicator',
    templateUrl: Path.ComponentView('indicator'),
    styleUrls: [Path.ComponentStyle('indicator')],
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

        this.subscribeNodeEvents(this.indicator);
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
                this.update();
            }
        }));
    }
}