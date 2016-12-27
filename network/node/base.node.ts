import { QueueOperators } from '../event/event-queue'
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { AppEventQueue } from '../event/app-event-queue';
import { ActivateNodeEvent } from '../event/app.event';

import { Common } from '../../app//utility/common';
import { ISession } from '../../core/lib/session';

import { NodeService } from '../../core/service/node.service';
import { Node, Activation } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

export abstract class BaseNode<T extends Node> {
    protected nodeId: string;
    private node: T;
    private nodes: T[];
    private nodeService: NodeService<T>;

    private subscribedTypes: { [key: number]: boolean  } = {};

    constructor(node: T, serviceType?: typeof NodeService) {
        if(serviceType) {
            this.nodeService = new serviceType(new MockSession({ uid: node.uid }));
        }

        if(node && this.nodeService) {
            this.setModel(node);
        }
        else {
            this.nodeId = Common.uniqueId();
        }
    }

    setModel(node: T) {
        this.node = node;
        this.nodeId = node._id;
        this.nodeService.getInputs(node._id).then(nodes => {
            this.updateInputs(nodes);
        });
    }

    getModel(): T {
        return this.node;
    }

    updateInputs(nodes: T[]) {
        this.nodes = nodes;
        nodes.forEach(n => {
            if(!this.subscribedTypes[n.ntype]) {
                this.subscribe(NodeConfig.activationEvent(n.ntype), 
                    event => {
                        this.receive(event);
                    }, 
                    { filter: (event, index) => { return Common.inArray(event.senderId, this.node.inputs); } }
                );
                this.subscribedTypes[n.ntype] = true;
            }
        });

        if(this.onUpdateInputs) {
            this.onUpdateInputs(this.nodes);
        }
    }

    onUpdateInputs: (nodes: Node[]) => void;

    abstract receive(event: ActivateNodeEvent);

    activate(event: ActivateNodeEvent) {
        this.notify(event);
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) {
        return AppEventQueue.subscribe(eventType, this.nodeId, callback, operators);
    }
    
    notify(event: BaseEvent<any>) {
        event.senderId = this.nodeId;
        AppEventQueue.notify(event);
    }
}

export class MockSession implements ISession {
    user: { uid: string };
    cookies: any;
    
    constructor(user: { uid: string }) {
        this.user = user;
    }
}