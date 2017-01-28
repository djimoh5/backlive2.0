import { BaseNode } from '../base.node';
import { ActivateNodeEvent, DataFilterEvent } from '../../event/app.event';

import { StrategyService } from '../../../core/service/strategy.service';
import { Strategy } from '../../../core/service/model/strategy.model';

export class StrategyNode extends BaseNode<Strategy> {
    constructor(node: Strategy) {
        super(node, StrategyService);
        var data: any = {
            universeTkrs: { incl: 1, tkrs: [
                'MSFT', 'BAC', 'JPM', 'ESV', 'AAPL', 'IBM', "RIG", "GS", "FB", "NFLX", "FCX", "CAT", "F", "GM", "C", "GOOGL", "XOM", "PSX"
            ] },
            startYr: 20150101,
            endYr: 20170101
        };

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