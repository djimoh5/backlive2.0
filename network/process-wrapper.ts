import { AppEventQueue } from './event/app-event-queue';
import { BaseEvent } from './event/base.event';
import { ActivateNodeEvent, InitNodeProcessEvent } from './event/app.event';

import { Node } from '../core/service/model/node.model';
import { ChildProcess } from 'child_process';

declare var process;

export class ProcessWrapper {
    process: ChildProcess;

    processedEvents: { [key: string]: boolean } = {};

    constructor() {
        this.process = require('child_process').fork('./network/node/process.node.ts');
        this.process.on('message', (event: BaseEvent<any>) => {
            if(event.eventName === ActivateNodeEvent.eventName) {
                event.isSocketEvent = ActivateNodeEvent.isSocketEvent;
            }

            AppEventQueue.notify(event);
        });
    }

    addNode(node: Node, outputs: string[]) {
        this.process.send(new InitNodeProcessEvent({ node: node, outputs: outputs }));
    }

    clearProcessedEvents() {
        this.processedEvents = {};
    }

    send(event: BaseEvent<any>) {
        var eventKey = `${event.date}${event.eventName}${event.senderId}`; 
        if(!this.processedEvents[eventKey]) {
            this.processedEvents[eventKey] = true;
            this.process.send(event);
        }
    }

    kill() {
        this.process.kill();
    }
}