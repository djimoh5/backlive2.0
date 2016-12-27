import { BaseNode } from '../base.node'
import { ActivateNodeEvent, DataFilterEvent, IndicatorEvent } from '../../event/app.event';

import { StrategyService } from '../../../core/service/strategy.service';
import { Strategy } from '../../../core/service/model/strategy.model';
import { Operator, IndicatorParam } from '../../../core/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../data/data.node';

import { IndicatorNode } from '../indicator/indicator.node';

import { ExecuteStrategyEvent } from '../../../app/component/strategy/strategy.event';

export class StrategyNode extends BaseNode<Strategy> {
    constructor(private model: Strategy) {
        super(model, StrategyService);

        this.subscribe(ExecuteStrategyEvent, event => this.executeStrategy(event));

        var data: any = {
            universeTkrs: { incl: 1, tkrs: ['MSFT', 'BAC', 'JPM', 'ESV', 'AAPL', 'IBM'] },
            startYr: 20150101,
            endYr: 20170101
        }

        this.notify(new DataFilterEvent({
            startDate: data.startYr, endDate: data.endYr,
            entities: (data.universeTkrs.incl === 1 && data.universeTkrs.tkrs && data.universeTkrs.tkrs.length > 0) ? data.universeTkrs.tkrs : null
        }));
    }

    receive(event: ActivateNodeEvent) {
        console.log('Strategy received an indicator update', event);
    }

    executeStrategy(event: ExecuteStrategyEvent) {
        console.log(event)
    }
}