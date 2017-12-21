import {Component, Input, Output, EventEmitter} from '@angular/core';

import {BaseComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'split-view',
    templateUrl: 'split-view.component.html',
    styleUrls: ['split-view.component.less']
})
export class SplitViewComponent extends BaseComponent {
    @Input() showPane: boolean;
    @Input() fixRightPane: boolean = false;
    @Output() showPaneChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    
    constructor(appService: AppService) {
        super(appService);
    }
    
    closePane() {
        this.showPane = false;
        this.showPaneChange.emit(this.showPane);
    }
}