import { AppEvent, BaseEvent } from './base.event';

import { Activation, ActivationError, NodeType } from '../../core/service/model/node.model';
import { DataCache, DataResult } from '../node/data/data.node';
import { Ticker } from '../../core/service/model/ticker.model';
import { IndicatorParam } from '../../core/service/model/indicator.model';

@AppEvent('Event.NetworkDate')
export class NetworkDateEvent extends BaseEvent<number> {}

/* activation events */

@AppEvent('Event.Node.Activate')
export class ActivateNodeEvent extends BaseEvent<Activation> {}

@AppEvent('Event.Node.FeedForwardComplete')
export class FeedForwardCompleteEvent extends BaseEvent<null> {}

@AppEvent('Event.Indicator')
export class IndicatorEvent extends ActivateNodeEvent { }

/* back propagation events */

@AppEvent('Event.Node.Backpropagate')
export class BackpropagateEvent extends BaseEvent<ActivationError> {}

@AppEvent('Event.Node.BackpropagateComplete')
export class BackpropagateCompleteEvent extends BaseEvent<null> {}

/* other events */

@AppEvent('Event.TrainingData')
export class TrainingDataEvent extends BaseEvent<{ input: number[][], output: { [key: string]: number } }> {}

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent<{ cache: DataCache, allCacheKeys?: string[] | number[] }> {}

@AppEvent('Event.Data.Subscription')
export class DataSubscriptionEvent extends BaseEvent<{ params: IndicatorParam[] }> {}

@AppEvent('Event.Data.Filter')
export class DataFilterEvent extends BaseEvent<{ startDate: number, endDate: number, entities?: string[] }> {}

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent<{}> {}

@AppEvent('Event.Order.Fill')
export class OrderFillEvent extends BaseEvent<{}> {}