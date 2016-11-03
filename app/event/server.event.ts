import { AppEvent, BaseEvent } from '../../network/event/base.event';
import { Strategy } from '../service/model/strategy.model';
import { LastPrice } from '../service/model/ticker.model';

@AppEvent('Event.ExecuteStrategy', true)
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.StrategyUpdate', true)
export class StrategyUpdateEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.TickerLastPrice', true)
export class TickerLastPriceEvent extends BaseEvent<{ [key: string]: LastPrice }> {}