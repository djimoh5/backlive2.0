import {DataCache, CacheResult} from '../../data-handler/data-handler';

import {Ticker} from '../../../app/service/model/ticker.model';
import {Param} from '../../../app/service/model/indicator.model';

export class AppEvent {
    static get eventName(): string { return '' };
    eventName: string;
    data: any;
    
    constructor(data: any, eventName: string) {
        this.eventName = eventName;
        this.data = data;
    }
}

export class DataEvent extends AppEvent {
    static get eventName(): string { return 'Event.Data' };
    constructor(public data: { cache: DataCache, allCacheKeys?: string[] | number[] }) {
        super(data, DataEvent.eventName);
    }
}

export class DataSubscriptionEvent extends AppEvent {
    static get eventName(): string { return 'Event.DataSubscription' };
    constructor(public data: { params: Param[], startDate: number, endDate: number, entities: string[] }) {
        super(data, DataSubscriptionEvent.eventName);
    }
}

export class SignalEvent extends AppEvent {
    static get eventName(): string { return 'Event.Signal' };
    ticker: Ticker[];
    constructor(public data: {}) {
        super(data, SignalEvent.eventName);
    }
}

export class OrderEvent extends AppEvent {
    static get eventName(): string { return 'Event.Order' };
    constructor(public data: {}) {
        super(data, OrderEvent.eventName);
    }
}

export class OrderFillEvent extends AppEvent {
    static get eventName(): string { return 'Event.OrderFill' };
    constructor(public data: {}) {
        super(data, OrderFillEvent.eventName);
    }
}