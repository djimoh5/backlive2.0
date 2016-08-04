import {DataCache, CacheResult} from '../../data-handler/data-handler';

import {Ticker, Param} from 'backlive/service/model';

export class TraderEvent {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

export class DataEvent extends TraderEvent {
    constructor(public cache?: DataCache[], public allCacheKeys?: string | number[]) {
        super('Event.Data');
    }
}

export class DataSubscriptionEvent extends TraderEvent {
    constructor(public params?: Param[]) {
        super('Event.DataSubscription');
    }
}

export class SignalEvent extends TraderEvent {
    tickers: Ticker[];
    constructor() {
        super('Event.Signal');
    }
}

export class OrderEvent extends TraderEvent {
    constructor() {
        super('Event.Order');
    }
}

export class OrderFillEvent extends TraderEvent {
    constructor() {
        super('Event.OrderFill');
    }
}