import { BaseNode } from '../base.node';
import { ActivateNodeEvent, DataFilterEvent } from '../../event/app.event';

import { StrategyService } from '../../../core/service/strategy.service';
import { Strategy } from '../../../core/service/model/strategy.model';

export class StrategyNode extends BaseNode<Strategy> {
    constructor(node: Strategy) {
        super(node, StrategyService);

        this.notify(new DataFilterEvent({
            startDate: node.startDate, 
            endDate: node.endDate,
            minMktCap: node.filter.minMktCap,
            maxMktCap: node.filter.maxMktCap,
            exclSectors: node.filter.exclSectors,
            index: node.filter.index,
            exchange: node.filter.exchange
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