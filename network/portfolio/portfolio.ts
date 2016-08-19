import {BaseNode} from '../base-node'

import {SignalEvent} from '../lib/events/app-event';
import {Strategy} from '../strategy/strategy';

import {Strategy as StrategyModel} from '../../app/service/model/strategy.model';

export class Portfolio extends BaseNode {
    constructor(private strategyId: string) {
        super();
        this.subscribe(SignalEvent, (event: SignalEvent) => this.processTrade(event)/*, { id: strategyId }*/);
    }
    
    processTrade(trade: SignalEvent) {
        console.log(trade);
    }
}