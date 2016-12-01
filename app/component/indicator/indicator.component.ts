import { Component, Input, Output, OnInit, EventEmitter, ElementRef } from '@angular/core';
import { Path } from 'backlive/config';
import { NodeComponent } from 'backlive/component/shared';

import { Common } from 'backlive/utility';

import { AppService, UserService, IndicatorService } from 'backlive/service';
import { Indicator, Node } from 'backlive/service/model';

import { IndicatorChangeEvent } from './indicator.event';

@Component({
    selector: 'backlive-indicator',
    templateUrl: Path.ComponentView('indicator'),
    styleUrls: [Path.ComponentStyle('indicator')],
    outputs: ['nodeChange', 'addInput', 'remove'] //inherited, workaround until angular fix
})
export class IndicatorComponent extends NodeComponent<Indicator> implements OnInit {
    @Input() indicator: Indicator;
      
    constructor(appService: AppService, private indicatorService: IndicatorService, private elementRef: ElementRef) {
        super(appService, indicatorService);
    }
    
    ngOnInit() {
        if(!this.indicator._id) {
            this.update();
        }

        this.subscribeNodeEvents(this.indicator);
    }

    update() {
        console.log('updating indicator');
        this.indicatorService.update(this.indicator).then(indicator => {
            if(indicator._id) {
                this.indicator._id = indicator._id;
                this.nodeChange.emit(this.indicator);
                this.appService.notify(new IndicatorChangeEvent(this.indicator));
            }
        });
    }

    getElement() {
        return this.elementRef.nativeElement;
    }
    
    onRemove() {
        this.remove.emit(true);
    }
}