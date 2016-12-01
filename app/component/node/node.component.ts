import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';
import { NodeService } from '../../service/node.service';

import { Node } from 'backlive/service/model';
import { NodeChangeEvent } from './node.event';
import { BaseEvent } from 'backlive/network/event';

@Component({
    selector: 'backlive-node',
    template: ``
})
export abstract class NodeComponent<T extends Node> extends BaseComponent {
    @Output() nodeChange: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() addInput: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() remove: EventEmitter<boolean> = new EventEmitter<boolean>();

    private node: Node;
    
    constructor(appService: AppService, private nodeService: NodeService<Node>) {
        super(appService);
    }

    protected subscribeNodeEvents(node: Node) {
        this.node = node;
        this.subscribeEvent(NodeChangeEvent, event => {
            this.update();
        }, { filter: (event: BaseEvent<Node>, index) => { return event.data._id === this.node._id } });
    }

    abstract update()
}