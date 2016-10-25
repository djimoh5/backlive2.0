import {BaseNode} from '../base-node'

import {SignalEvent} from '../../event/app.event';

import {Strategy as StrategyModel} from '../../../app/service/model/strategy.model';

export class Portfolio extends BaseNode {
    constructor(private strategyId: string) {
        super();
        this.subscribe(SignalEvent, event => this.processTrade(event)/*, { id: strategyId }*/);
    }
    
    processTrade(trade: SignalEvent) {
        console.log(trade);
    }
}