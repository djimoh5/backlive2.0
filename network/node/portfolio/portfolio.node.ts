import { BaseNode } from '../base.node'

import { StrategyEvent } from '../../event/app.event';

import { Portfolio } from '../../../core/service/model/portfolio.model';

export class PortfolioNode extends BaseNode<Portfolio> {
    constructor(private model: Portfolio) {
        super(model);
        this.subscribe(StrategyEvent, event => this.processTrade(event)/*, { id: strategyId }*/);
    }

    processTrade(trade: StrategyEvent) {
        console.log(trade);
    }

    receive() {}
}