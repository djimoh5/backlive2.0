import {Ticker} from 'backlive/service/model';

export class TraderEvent {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

export class DataEvent extends TraderEvent {
    constructor() {
        super('Event.Data');
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