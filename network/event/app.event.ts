import { AppEvent, SocketEvent, BaseEvent } from './base.event';

import { Node, Activation, ActivationError } from '../../core/service/model/node.model';
import { DataCache } from '../node/data/data.node';
import { IndicatorParam } from '../../core/service/model/indicator.model';

@AppEvent('Event.Network.EpochComplete')
export class EpochCompleteEvent extends BaseEvent<null> {}

@AppEvent('Event.Node.InitProcess')
export class InitNodeProcessEvent extends BaseEvent<{ node: Node, outputs: string[] }> {}

@AppEvent('Event.Node.ProcessReady')
export class NodeProcessReadyEvent extends BaseEvent<string> {}

/* activation events */

@AppEvent('Event.Node.Activate')
export class ActivateNodeEvent extends BaseEvent<Activation> {}

@AppEvent('Event.Node.UpdateWeights')
export class UpdateNodeWeightsEvent extends BaseEvent<null> {} //learningRate

/* back propagation events */

@AppEvent('Event.Node.Backpropagate')
export class BackpropagateEvent extends BaseEvent<ActivationError> {}

@AppEvent('Event.Node.BackpropagateComplete')
export class BackpropagateCompleteEvent extends BaseEvent<null> {}

/* other events */

@AppEvent('Event.Data.Initialize')
export class TrainDataEvent extends BaseEvent<number> {}

@AppEvent('Event.Data.Validate')
export class ValidateDataEvent extends BaseEvent<null> {}

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent<{ cache: DataCache, allCacheKeys?: string[] | number[] }> {}

@AppEvent('Event.Data.Subscription')
export class DataSubscriptionEvent extends BaseEvent<{ params: IndicatorParam[], isFeature?: boolean }> {}

@AppEvent('Event.Data.FeatureEvent')
export class DataFeatureEvent extends BaseEvent<{ [key: string]: number }> {}

@AppEvent('Event.Data.FeatureOutEvent')
export class DataFeatureLabelEvent extends BaseEvent<{ [key: string]: number[] }> {}

@AppEvent('Event.Data.Filter')
export class DataFilterEvent extends BaseEvent<{ 
    startDate: number, 
    endDate: number, 
    minMktCap?: number;
    maxMktCap?: number;
    exclSectors?: string[];
    tickers?: { incl: 1|0, tkrs: string[] };
    exchange?: ''|'N'|'M'|'A';
    index?: ''|'sp'|'dow';
    adr?: 1|0;
}> {}

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent<{}> {}

@AppEvent('Event.Order.Fill')
export class OrderFillEvent extends BaseEvent<{}> {}