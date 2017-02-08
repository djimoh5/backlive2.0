export function AppEvent(name: string) {
    return function (target: typeof BaseEvent) {
        target.eventName = name;
    };
}

export function SocketEvent(name: string) {
    return function (target: typeof BaseEvent) {
        target.eventName = name;
        target.isSocketEvent = true;
    };
}

export class BaseEvent<T> {
    static eventName: string;
    static isSocketEvent: boolean;

    eventName: string;
    isSocketEvent: boolean;
    data: T;
    date: number;
    senderId: string;
    
    constructor(data: T, date?: number) {
        this.data = data;
        this.date = date || Date.now();
        this.eventName = (<typeof BaseEvent> this.constructor).eventName;
        this.isSocketEvent = (<typeof BaseEvent> this.constructor).isSocketEvent;
    }
}

export declare type TypeOfBaseEvent<T> = { new(data: any): T; } & typeof BaseEvent;

export interface BaseEventCallback<T extends BaseEvent<any>> {
    (event: T);
}