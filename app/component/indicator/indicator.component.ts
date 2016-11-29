import { Component, Input, Output, OnInit, EventEmitter, ElementRef } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { Common } from 'backlive/utility';

import { AppService, UserService, IndicatorService } from 'backlive/service';
import { Indicator } from 'backlive/service/model';

import { IndicatorChangeEvent } from './indicator.event';

@Component({
    selector: 'backlive-indicator',
    templateUrl: Path.ComponentView('indicator'),
    styleUrls: [Path.ComponentStyle('indicator')]
})
export class IndicatorComponent extends BaseComponent implements OnInit {
    compare: number = 2;
    level: number = 0;
    
    @Input() indicator: Indicator;
    @Output() indicatorChange: EventEmitter<Indicator> = new EventEmitter<Indicator>();
    
    @Output() remove: EventEmitter<boolean> = new EventEmitter<boolean>();
      
    constructor(appService: AppService, private elementRef: ElementRef, private indicatorService: IndicatorService) {
        super(appService);
    }
    
    ngOnInit() {
        if(!this.indicator._id) {
            this.updateIndicator();
        }
    }

    updateIndicator() {
        this.indicatorService.update(this.indicator).then(indicator => {
            if(indicator._id) {
                this.indicator = indicator;
                this.indicatorChange.emit(this.indicator);
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