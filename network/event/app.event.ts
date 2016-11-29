import { AppEvent, BaseEvent } from './base.event';

import { DataCache, DataResult } from '../node/data/data.node';
import { Ticker } from '../../core/service/model/ticker.model';
import { IndicatorParam } from '../../core/service/model/indicator.model';

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent<{ cache: DataCache, allCacheKeys?: string[] | number[] }> { }

@AppEvent('Event.Data.Subscription')
export class DataSubscriptionEvent extends BaseEvent<{ params: IndicatorParam[] }> { }

@AppEvent('Event.Data.Filter')
export class DataFilterEvent extends BaseEvent<{ startDate: number, endDate: number, entities?: string[] }> { }

@AppEvent('Event.Indicator')
export class IndicatorEvent extends BaseEvent<{ [key: string]: number }> { }

@AppEvent('Event.Strategy')
export class StrategyEvent extends BaseEvent<Ticker[]> { }

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent<{}> { }

@AppEvent('Event.Order.Fill')
export class OrderFillEvent extends BaseEvent<{}> { }