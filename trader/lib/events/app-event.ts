import {DataCache, CacheResult} from '../../data-handler/data-handler';

import {Ticker, Param} from 'backlive/service/model';

export class AppEvent {
    static get name(): string { return '' };
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }
}

export class DataEvent extends AppEvent {
    static get name(): string { return 'Event.Data' };
    constructor(public cache: DataCache[], public allCacheKeys?: string | number[]) {
        super(DataEvent.name);
    }
}

export class DataSubscriptionEvent extends AppEvent {
    static get name(): string { return 'Event.DataSubscription' };
    constructor(public params: Param[]) {
        super(DataSubscriptionEvent.name);
    }
}

export class SignalEvent extends AppEvent {
    static get name(): string { return 'Event.Signal' };
    tickers: Ticker[];
    constructor() {
        super(SignalEvent.name);
    }
}

export class OrderEvent extends AppEvent {
    static get name(): string { return 'Event.Order' };
    constructor() {
        super(OrderEvent.name);
    }
}

export class OrderFillEvent extends AppEvent {
    static get name(): string { return 'Event.OrderFill' };
    constructor() {
        super(OrderFillEvent.name);
    }
}