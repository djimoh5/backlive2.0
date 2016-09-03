import {DataCache, CacheResult} from '../../data-handler/data-handler';

import {Ticker} from '../../../app/service/model/ticker.model';
import {Param} from '../../../app/service/model/indicator.model';

function AppEvent(name: string) {
    return function (target: typeof BaseEvent) {
        target.eventName = name;
        console.log(target);
    }
}

export class BaseEvent {
    static get eventName() { return ''; };
    static set eventName(eventName: string) { this.eventName = eventName; };
    eventName: string;
    data: any;
    
    constructor(data: any) {
        this.data = data;
        this.eventName = (<typeof BaseEvent> this.constructor).eventName;
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
    constructor(data: { params: Param[], startDate: number, endDate: number, entities: string[] }) {
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