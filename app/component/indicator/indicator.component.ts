import { Component, Input, Output, OnInit, EventEmitter, ElementRef } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { Common } from 'backlive/utility';

import { AppService, UserService } from 'backlive/service';
import { Indicator } from 'backlive/service/model';

@Component({
    selector: 'backlive-indicator',
    templateUrl: Path.ComponentView('indicator'),
    styleUrls: [Path.ComponentStyle('indicator')]
})
export class IndicatorComponent extends BaseComponent implements OnInit {
    compare: number = 2;
    level: number = 0;
    
    @Input() indicator: Indicator;
    @Input() isChild: boolean;
    
    @Output() remove: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() readOnlyChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() groupIndicator: EventEmitter<boolean> = new EventEmitter<boolean>();
      
    constructor(appService: AppService, private elementRef: ElementRef) {
        super(appService);
    }
    
    ngOnInit() {
    }

    getElement() {
        return this.elementRef.nativeElement;
    }
    
    onRemove() {
        this.remove.emit(true);
    }
}