import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Path} from 'backlive/config';

import {BaseComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';

@Component({
    selector: 'split-view',
    templateUrl: Path.ComponentView('shared/split-view'),
    styleUrls: [Path.ComponentStyle('shared/split-view')]
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