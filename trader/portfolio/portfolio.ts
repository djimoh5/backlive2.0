import {EventQueue} from '../lib/events/event-queue';
import {SignalEvent} from '../lib/events/trader-event';
import {Strategy} from '../strategy/strategy';

import {Strategy as StrategyModel} from 'backlive/service/model';

export class Portfolio extends EventQueue {
    constructor(private strategy: Strategy) {
        super();
        strategy.subscribe(this, new SignalEvent(), (event: SignalEvent) => this.processTrade(event));
    }
    
    processTrade(trade: SignalEvent) {
        
    }
}