import { AppEvent, BaseEvent } from './base.event';

import {DataCache, DataResult} from '../node/data-handler/data-handler';
import {Ticker} from '../../app/service/model/ticker.model';
import {IndicatorParam} from '../../app/service/model/indicator.model';

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent<{ cache: DataCache, allCacheKeys?: string[] | number[] }> {}

@AppEvent('Event.DataSubscription')
export class DataSubscriptionEvent extends BaseEvent<{ params: IndicatorParam[] }> {}

@AppEvent('Event.DataFilter')
export class DataFilterEvent extends BaseEvent<{ startDate: number, endDate: number, entities?: string[] }> {}

@AppEvent('Event.IndicatorUpdate')
export class IndicatorUpdateEvent extends BaseEvent<{ [key: string]: number }> {}

@AppEvent('Event.Signal')
export class SignalEvent extends BaseEvent<Ticker[]> {}

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent<{}> {}

@AppEvent('Event.DataSubscrOrderFilliption')
export class OrderFillEvent extends BaseEvent<{}> {}