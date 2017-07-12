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
        }), true);
    }

    receive(event: ActivateNodeEvent) {
        //console.log('Strategy received an event', event.senderId);
        //for now just pass through activation to portfolios
        this.activate(event);
    }
}