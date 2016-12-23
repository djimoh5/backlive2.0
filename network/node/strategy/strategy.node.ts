import { BaseNode } from '../base.node'
import { ActivateNodeEvent, DataFilterEvent, IndicatorEvent } from '../../event/app.event';

import { Strategy } from '../../../core/service/model/strategy.model';
import { Operator, IndicatorParam } from '../../../core/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../data/data.node';

import { IndicatorNode } from '../indicator/indicator.node';

import { ExecuteStrategyEvent } from '../../../app/component/strategy/strategy.event';

export class StrategyNode extends BaseNode<Strategy> {
    constructor(private model: Strategy) {
        super(model);

        model.inputs.forEach(node => {

        });
        /*this.allIndicators = data.indicators.long.concat(data.indicators.short, data.exposure.long, data.exclusions);

        this.allIndicators.forEach(indModel => {
            new IndicatorNode(indModel);
        })

        this.subscribe(IndicatorEvent, event => this.processIndicator(event));
        this.subscribe(ExecuteStrategyEvent, event => this.executeStrategy(event));

        this.notify(new DataFilterEvent({
            startDate: data.startYr, endDate: data.endYr,
            entities: (data.universeTkrs.incl === 1 && data.universeTkrs.tkrs && data.universeTkrs.tkrs.length > 0) ? data.universeTkrs.tkrs : null
        }));*/
    }

    receive(event: ActivateNodeEvent) {
        console.log('Strategy received an indicator update', event);
    }

    executeStrategy(event: ExecuteStrategyEvent) {
        console.log(event)
    }
}