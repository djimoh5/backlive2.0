import { AppEvent, BaseEvent } from './base.event';

import { Activation, NodeType } from '../../core/service/model/node.model';
import { DataCache, DataResult } from '../node/data/data.node';
import { Ticker } from '../../core/service/model/ticker.model';
import { IndicatorParam } from '../../core/service/model/indicator.model';

@AppEvent('Event.Node.Activate')
export class ActivateNodeEvent extends BaseEvent<Activation> {
    static ntype: NodeType;
    ntype: NodeType;
    constructor(data: any) { 
        super(data);
        this.ntype = (<typeof ActivateNodeEvent> this.constructor).ntype;
    }
}

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent<{ cache: DataCache, allCacheKeys?: string[] | number[] }> { }

@AppEvent('Event.Data.Subscription')
export class DataSubscriptionEvent extends BaseEvent<{ params: IndicatorParam[] }> { }

@AppEvent('Event.Data.Filter')
export class DataFilterEvent extends BaseEvent<{ startDate: number, endDate: number, entities?: string[] }> { }

@AppEvent('Event.Indicator')
export class IndicatorEvent extends ActivateNodeEvent { }

@AppEvent('Event.Strategy')
export class StrategyEvent extends ActivateNodeEvent { }

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent<{}> { }

@AppEvent('Event.Order.Fill')
export class OrderFillEvent extends BaseEvent<{}> { }