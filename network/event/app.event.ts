import { AppEvent, SocketEvent, BaseEvent } from './base.event';

import { Activation, ActivationError } from '../../core/service/model/node.model';
import { DataCache } from '../node/data/data.node';
import { IndicatorParam } from '../../core/service/model/indicator.model';

@AppEvent('Event.Network.Date')
export class NetworkDateEvent extends BaseEvent<number> {}

@AppEvent('Event.Network.EpochComplete')
export class EpochCompleteEvent extends BaseEvent<number> {}

/* activation events */

@SocketEvent('Event.Node.Activate')
export class ActivateNodeEvent extends BaseEvent<Activation> {}

@AppEvent('Event.Node.FeedForwardComplete')
export class FeedForwardCompleteEvent extends BaseEvent<null> {}

@AppEvent('Event.Node.UpdateWeights')
export class UpdateNodeWeightsEvent extends BaseEvent<number> {} //learningRate

/* back propagation events */

@AppEvent('Event.Node.Backpropagate')
export class BackpropagateEvent extends BaseEvent<ActivationError> {}

@AppEvent('Event.Node.BackpropagateComplete')
export class BackpropagateCompleteEvent extends BaseEvent<null> {}

/* other events */

@AppEvent('Event.TrainingData')
export class TrainingDataEvent extends BaseEvent<{ input: number[][], output: { [key: string]: number } }> {}

@AppEvent('Event.Data.Initialize')
export class InitializeDataEvent extends BaseEvent<null> {}

@AppEvent('Event.Data.Validate')
export class ValidateDataEvent extends BaseEvent<null> {}

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