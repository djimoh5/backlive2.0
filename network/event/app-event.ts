import {DataCache, DataResult} from '../node/data-handler/data-handler';

import {Ticker} from '../../app/service/model/ticker.model';
import {IndicatorParam} from '../../app/service/model/indicator.model';

export function AppEvent(name: string, isServer: boolean = false) {
    return function (target: typeof BaseEvent) {
        target.eventName = name;
        target.isServer = isServer;
    }
}

export class BaseEvent<T> {
    static eventName: string;
    static isServer: boolean;

    eventName: string;
    isServer: boolean;
    data: T;
    
    constructor(data: T) {
        this.data = data;
        this.eventName = (<typeof BaseEvent> this.constructor).eventName;
        this.isServer = (<typeof BaseEvent> this.constructor).isServer;
    }
}

export declare type TypeOfBaseEvent<T> = { new(data: any): T; } & typeof BaseEvent;

export interface BaseEventCallback<T extends BaseEvent<any>> {
    (event: T);
}

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