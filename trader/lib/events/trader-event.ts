import {Ticker} from 'backlive/service/model';

export class TraderEvent {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class DataEvent extends TraderEvent {
    constructor() {
        super('Event.Data');
    }
}

class SignalEvent extends TraderEvent {
    constructor() {
        super('Event.Signal');
    }
}

class OrderEvent extends TraderEvent {
    constructor() {
        super('Event.Order');
    }
}

class OrderFillEvent extends TraderEvent {
    constructor() {
        super('Event.OrderFill');
    }
}