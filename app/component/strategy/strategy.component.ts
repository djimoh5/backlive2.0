import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Path } from 'backlive/config';
import { NodeComponent } from 'backlive/component/shared';
import { StrategyEditorComponent } from './editor/editor.component';

import { AppService, StrategyService } from 'backlive/service';

import { Indicator, Strategy } from 'backlive/service/model';
import { ExecuteStrategyEvent } from './strategy.event';

import { OpenFooterModalEvent } from 'backlive/event';

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

    onEdit() {
        this.appService.notify(new OpenFooterModalEvent({ 
            title: 'Edit Strategy',
            body: StrategyEditorComponent,
            model: {
                strategy: this.strategy
            },
            onModalClose: () => {
                this.update();
            }
        }));
    }

    executeStrategy() {
        this.appService.notify(new ExecuteStrategyEvent(this.strategy));
    }
    
    getElement() {
        return this.elementRef.nativeElement;
    }
}