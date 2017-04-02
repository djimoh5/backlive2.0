import { Component, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from 'backlive/component/shared';
import { LibraryComponent } from '../network/library/library.component';

import { AppService } from 'backlive/service';
import { NodeService } from '../../service/node.service';

import { Node } from 'backlive/service/model';
import { OpenFooterModalEvent } from 'backlive/event';
import { NodeChangeEvent, RemoveNodeEvent } from './node.event';

@Component({
    selector: 'backlive-node',
    template: ``
})
export abstract class NodeComponent<T extends Node> extends BaseComponent {
    @Output() nodeChange: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() addInput: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() remove: EventEmitter<Node> = new EventEmitter<Node>();

    static outputs = ['nodeChange', 'addInput', 'remove'];

    private node: Node;
    inputs: Node[] = [];
    
    constructor(appService: AppService, private nodeService: NodeService<Node>) {
        super(appService);
    }

    protected subscribeNodeEvents(node: Node) {
        this.node = node;
        this.subscribeEvent(NodeChangeEvent, event => {
            this.update();
        }, { filter: (event, index) => { return event.data._id === this.node._id; } });
    }

    abstract update()

    onRemove() {
        this.nodeService.remove(this.node._id).then(success => {
            if(success) {
                this.remove.emit(this.node);
                this.appService.notify(new RemoveNodeEvent(this.node._id));
            }
        });
    }

    getInputs() {
        this.nodeService.getInputs(this.node._id).then(nodes => {
            this.inputs = nodes;
        });
    }

    showLibrary() {
        this.appService.notify(new OpenFooterModalEvent({ 
            title: 'Add Input',
            body: LibraryComponent,
            eventHandlers: { 
                select: (node: Node) => {
                    if(!this.node.inputs) {
                       this.node.inputs = [];
                    }

                    this.node.inputs.push(node._id);
                    this.inputs.push(node);
                    this.update();
                }
            },
            onModalClose: () => {
            }
        }));
    }
}