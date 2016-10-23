import {DataCache, DataResult} from '../../node/data-handler/data-handler';

import {Ticker} from '../../../app/service/model/ticker.model';
import {IndicatorParam} from '../../../app/service/model/indicator.model';

export function AppEvent(name: string, isServer: boolean = false) {
    return function (target: typeof BaseEvent) {
        target.eventName = name;
        target.isServer = isServer;
    }
}

export class BaseEvent {
    static eventName: string;
    static isServer: boolean;

    eventName: string;
    isServer: boolean;
    data: any;
    
    constructor(data: any) {
        this.data = data;
        this.eventName = (<typeof BaseEvent> this.constructor).eventName;
        this.isServer = (<typeof BaseEvent> this.constructor).isServer;
    }
}

@AppEvent('Event.Data')
export class DataEvent extends BaseEvent {
    constructor(data: { cache: DataCache, allCacheKeys?: string[] | number[] }) {
        super(data);
    }
}

@AppEvent('Event.DataSubscription')
export class DataSubscriptionEvent extends BaseEvent {
    constructor(data: { params: IndicatorParam[] }) {
        super(data);
    }
}

@AppEvent('Event.DataFilter')
export class DataFilterEvent extends BaseEvent {
    constructor(data: { startDate: number, endDate: number, entities?: string[] }) {
        super(data);
    }
}

@AppEvent('Event.IndicatorUpdate')
export class IndicatorUpdateEvent extends BaseEvent {
    constructor(data: { [key: string]: number }) {
        super(data);
    }
}

@AppEvent('Event.Signal')
export class SignalEvent extends BaseEvent {
    ticker: Ticker[];
    constructor(data: {}) {
        super(data);
    }
}

@AppEvent('Event.Order')
export class OrderEvent extends BaseEvent {
    constructor(data: {}) {
        super(data);
    }
}

@AppEvent('Event.DataSubscrOrderFilliption')
export class OrderFillEvent extends BaseEvent {
    constructor(data: {}) {
        super(data);
    }
}