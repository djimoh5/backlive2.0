import { Component, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from 'backlive/component/shared';
import { LibraryComponent } from '../network/library/library.component';

import { AppService } from 'backlive/service';
import { NodeService } from '../../service/node.service';

import { Node, NodeType } from 'backlive/service/model';
import { OpenFooterModalEvent, CloseFooterModalEvent, RedrawNetworkEvent } from 'backlive/event';
import { NodeChangeEvent, RemoveNodeEvent } from './node.event';

import { NetworkComponent } from '../network/network.component';

import { Common } from 'backlive/utility';

declare var d3;

@Component({
    selector: 'backlive-node',
    template: ``
})
export abstract class NodeComponent<T extends Node> extends BaseComponent {
    @Output() nodeChange: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() loadInputs: EventEmitter<Node[]> = new EventEmitter<Node[]>();
    @Output() addInput: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() remove: EventEmitter<Node> = new EventEmitter<Node>();

    static outputs = ['nodeChange', 'loadInputs', 'addInput', 'remove'];

    private node: Node;
    inputs: Node[] = [];

    indicatorSize = { width: 38, height: 34 };
    
    constructor(appService: AppService, private nodeService: NodeService<Node>) {
        super(appService);
    }

    protected init(node: Node) {
        this.node = node;

        this.getInputs(true);

        this.subscribeEvent(NodeChangeEvent, event => {
            this.update();
            
            if(this.node.inputs && this.node.inputs.length !== this.inputs.length) {
                this.getInputs();
            }
        }, { filter: (event, index) => { return event.data._id === this.node._id; } });

        this.subscribeEvent(RemoveNodeEvent, event => {
            this.onInputRemoved(event.data);
        }, { filter: (event, index) => { return this.inputs.indexOf(event.data) >= 0; } });

        this.subscribeEvent(RedrawNetworkEvent, event => this.redraw());
    }

    abstract update()

    onRemove() {
        this.nodeService.remove(this.node._id).then(success => {
            if(success) {
                this.appService.notify(new RemoveNodeEvent(this.node));
                this.remove.emit(this.node);
            }
        });
    }

    onInputRemoved(input: Node) {
        this.node.inputs.splice(this.node.inputs.indexOf(input._id), 1);
        this.inputs.splice(this.inputs.indexOf(input), 1);
        this.update();
        this.redraw();
    }

    getInputs(init: boolean = false) {
        if(this.node.inputs) {
            this.nodeService.getInputs(this.node._id).then(nodes => {
                this.inputs = nodes;
                if(this.inputs.length > 0) {
                    this.node.inputs = []; //in case there are any deleted nodes still in inputs
                    this.inputs.forEach(n => {
                        this.node.inputs.push(n._id);
                    });
                }
                else {
                    delete this.node.inputs;
                    delete this.node.weights;
                }

                this.redraw();

                if(init) {
                    this.loadInputs.emit(this.inputs);
                }
            });
        }
    }

    showLibrary() {
        this.appService.notify(new OpenFooterModalEvent({ 
            title: 'Add Input',
            body: LibraryComponent,
            eventHandlers: { 
                select: (node: Node) => {
                    this.newInput(node);
                }
            }
        }));
    }

    private newInput(node: Node) {
        this.inputs.push(node);
        this.redraw();
        this.addInput.emit(node);
    }

    redraw(animating: boolean = false) {
        console.log(this.inputs.length);
        if(this.inputs.length > 0) {
            var yRadius = 250, xRadiusPercent = 40, angleOffset = 10, startAngle = 180;
            var prevAngle: number;

            if(!animating) {
                startAngle += (this.inputs.length - 1) * (angleOffset / 2); //only needed when not animating
            }

            var firstNode = true;
            this.inputs.forEach(node => {
                if(node.ntype === NodeType.Indicator) {
                    var angle = firstNode ? startAngle : (prevAngle - angleOffset);
                    prevAngle = angle;
                    firstNode = false;

                    node.position = {
                        x: xRadiusPercent * Math.cos(angle / 180 * Math.PI),
                        y: yRadius * Math.sin(angle / 180 * Math.PI) - (this.indicatorSize.height / 2) - 30 //extra 30 for amount strategy pod is off center;
                    };
                }

                this.setNodeLine(node);
            });
        }
    }

    setNodeLine(node: Node) {
        var centerX = NetworkComponent.canvas.center.x;
        var centerY = NetworkComponent.canvas.center.y;
        var x1: number, y1: number, x2: number, y2: number;

        switch(node.ntype) {
            case NodeType.Indicator:
                x1 = centerX + (centerX * 2 * node.position.x / 100); 
                y1 = centerY + node.position.y + (this.indicatorSize.height / 2);
                x2 = centerX; 
                y2 = centerY - 30;
                break;
            case NodeType.Strategy:
                x1 = centerX; y1 = centerY - 30;
                x2 = (centerX * 2) * .9 - 50; y2 = centerY - 30;
                break;
        }

        node['line'] = Common.getLine(x1, y1, x2, y2);
        console.log(node['line']);
    }
}