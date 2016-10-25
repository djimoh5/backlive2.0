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