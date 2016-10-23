import { AppEvent, BaseEvent } from 'backlive/network/event';
import { Strategy, LastPrice } from 'backlive/service/model';

@AppEvent('Event.ExecuteStrategy', true)
export class ExecuteStrategyEvent extends BaseEvent {
    constructor(data: Strategy) { super(data); }
}

@AppEvent('Event.StrategyUpdate', true)
export class StrategyUpdateEvent extends BaseEvent {
    constructor(data: number) { super(data); }
}

@AppEvent('Event.TickerLastPrice', true)
export class TickerLastPriceEvent extends BaseEvent {
    constructor(data: { [key: string] : LastPrice }) { super(data); }
}