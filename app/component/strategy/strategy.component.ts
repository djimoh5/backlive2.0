import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Path } from 'backlive/config';
import { NodeComponent } from 'backlive/component/shared';

import { AppService, UserService, StrategyService } from 'backlive/service';

import { Indicator, Strategy, Node } from 'backlive/service/model';
import { ExecuteStrategyEvent } from './strategy.event';
import { IndicatorEvent } from 'backlive/network/event';

@Component({
    selector: 'backlive-strategy',
    templateUrl: Path.ComponentView('strategy'),
    styleUrls: [Path.ComponentStyle('strategy')],
    outputs: NodeComponent.outputs //inherited, workaround until angular fix
})
export class StrategyComponent extends NodeComponent<Strategy> implements OnInit {
    @Input() strategy: Strategy;
    
    constructor(appService: AppService, private strategyService: StrategyService,  private elementRef: ElementRef) {
        super(appService, strategyService);
    }
    
    ngOnInit() {
        this.subscribeNodeEvents(this.strategy);
    }

    update() {
        if(this.strategy.name) {
            this.strategyService.update(this.strategy).then(strategy => {
                if(strategy._id) {
                    this.strategy._id = strategy._id;
                    this.nodeChange.emit(this.strategy);
                }
            });
        }
    }

    addIndicator() {
        this.addInput.emit(new Indicator());
    }

    editStrategy() {

    }

    executeStrategy() {
        this.appService.notify(new ExecuteStrategyEvent(this.strategy));
    }
    
    getElement() {
        return this.elementRef.nativeElement;
    }
}