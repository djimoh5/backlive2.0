import { BaseNode } from '../base.node'

import { StrategyEvent } from '../../event/app.event';

import { Strategy as StrategyModel } from '../../../core/service/model/strategy.model';

export class PortfolioNode extends BaseNode {
    constructor(private strategyId: string) {
        super();
        this.subscribe(StrategyEvent, event => this.processTrade(event)/*, { id: strategyId }*/);
    }

    processTrade(trade: StrategyEvent) {
        console.log(trade);
    }
}