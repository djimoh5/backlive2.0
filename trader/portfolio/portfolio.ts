import {Base} from '../base'

import {SignalEvent} from '../lib/events/app-event';
import {Strategy} from '../strategy/strategy';

import {Strategy as StrategyModel} from 'backlive/service/model';

export class Portfolio extends Base {
    constructor(private strategyId: string) {
        super();
        this.subscribe(SignalEvent, (event: SignalEvent) => this.processTrade(event)/*, { id: strategyId }*/);
    }
    
    processTrade(trade: SignalEvent) {
        
    }
}