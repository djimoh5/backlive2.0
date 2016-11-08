import { AppEvent, BaseEvent } from './base.event';

import { DataCache, DataResult } from '../node/data/data.node';
import { Ticker } from '../../app/service/model/ticker.model';
import { IndicatorParam } from '../../app/service/model/indicator.model';

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent<{ cache: DataCache, allCacheKeys?: string[] | number[] }> { }

@AppEvent('Event.DataSubscription')
export class DataSubscriptionEvent extends BaseEvent<{ params: IndicatorParam[] }> { }

@AppEvent('Event.DataFilter')
export class DataFilterEvent extends BaseEvent<{ startDate: number, endDate: number, entities?: string[] }> { }

@AppEvent('Event.Indicator')
export class IndicatorEvent extends BaseEvent<{ [key: string]: number }> { }

@AppEvent('Event.Strategy')
export class StrategyEvent extends BaseEvent<Ticker[]> { }

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent<{}> { }

@AppEvent('Event.OrderFill')
export class OrderFillEvent extends BaseEvent<{}> { }