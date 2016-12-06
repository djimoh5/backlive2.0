import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';

import { BaseComponent } from 'backlive/component/shared';
import { Common } from 'backlive/utility';

import { AppService, StrategyService } from 'backlive/service';
import { Strategy, Node } from 'backlive/service/model';

import { StrategyChangeEvent } from '../strategy.event';

@Component({
    selector: 'backlive-strategy-editor',
    templateUrl: Path.ComponentView('strategy/editor'),
    styleUrls: [Path.ComponentStyle('strategy/editor')],
})
export class StrategyEditorComponent extends BaseComponent implements OnInit {
    @Input() strategy: Strategy;
      
    constructor(appService: AppService, private strategyService: StrategyService) {
        super(appService);
    }
    
    ngOnInit() {
        
    }
}