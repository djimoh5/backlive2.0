import {Injectable} from '@angular/core';

import { BaseEvent } from 'backlive/network/event';

declare var io;

@Injectable()
export class ClientSocket {
    private socket: Socket;

    constructor() {
        this.socket = io();
    }

    on(eventName: string, callback: (data: BaseEvent<any>) => void) {
        this.socket.on(eventName, callback);
    }
    
    emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }
}

export interface Socket {
    on: (eventName: string, callback: (data: BaseEvent<any>) => void) => void;
    emit: (eventName: string, data: any) => void;
}