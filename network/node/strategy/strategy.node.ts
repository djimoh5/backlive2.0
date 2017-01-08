import { BaseNode } from '../base.node'
import { ActivateNodeEvent, DataFilterEvent, IndicatorEvent } from '../../event/app.event';

import { StrategyService } from '../../../core/service/strategy.service';
import { Strategy } from '../../../core/service/model/strategy.model';
import { Operator, IndicatorParam } from '../../../core/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../data/data.node';

import { IndicatorNode } from '../indicator/indicator.node';

export class StrategyNode extends BaseNode<Strategy> {
    constructor(private model: Strategy) {
        super(model, StrategyService);
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
        //console.log('Strategy received an event', event.senderId);
        if(this.numOutputs() === 1) { //one portfolio is output so just pass through value, as this strategy is the REAL output
            this.activate(null, false);
        }
        else {
            this.activate();
        }
    }
}