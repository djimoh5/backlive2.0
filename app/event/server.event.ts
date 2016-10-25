import { AppEvent, BaseEvent } from 'backlive/network/event';
import { Strategy, LastPrice } from 'backlive/service/model';

@AppEvent('Event.ExecuteStrategy', true)
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.StrategyUpdate', true)
export class StrategyUpdateEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.TickerLastPrice', true)
export class TickerLastPriceEvent extends BaseEvent<{ [key: string]: LastPrice }> {}