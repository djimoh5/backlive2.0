import { Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { LibraryComponent } from '../network/library/library.component';

import { AppService } from 'backlive/service';
import { NodeService } from '../../service/node.service';

import { Node, NodeType } from 'backlive/service/model';
import { OpenFooterModalEvent, CloseFooterModalEvent, RedrawNodeEvent } from 'backlive/event';
import { NodeChangeEvent, RemoveNodeEvent } from './node.event';

import { PlatformUI } from 'backlive/utility/ui';

import { Common } from 'backlive/utility';

declare var d3;

export abstract class NodeComponent<T extends Node> extends BaseComponent {
    @Output() nodeChange: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() loadInputs: EventEmitter<Node[]> = new EventEmitter<Node[]>();
    @Output() addInput: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() remove: EventEmitter<Node> = new EventEmitter<Node>();

    static outputs = ['nodeChange', 'loadInputs', 'addInput', 'remove'];

    private node: Node;
    inputs: Node[] = [];

    constructor(appService: AppService, private nodeService: NodeService<Node>) {
        super(appService);
    }

    protected init(node: Node) {
        this.node = node;

        this.getInputs(true);

        this.subscribeEvent(NodeChangeEvent, event => {
            this.update();
            
            if(this.node.inputs && this.node.inputs.length !== this.inputs.length) {
                this.getInputs(true);
            }
        }, { filter: (event, index) => { return event.data._id === this.node._id; } });

        this.subscribeEvent(RemoveNodeEvent, event => {
            this.onInputRemoved(event.data);
        }, { filter: (event, index) => { return this.inputs.indexOf(event.data) >= 0; } });

        this.subscribeEvent(RedrawNodeEvent, event => this.redraw(), { 
            filter: (event, index) => { return this.node._id === event.data; } 
        });
    }

    abstract update()

    onRemove() {
        if(!this.node.name) {
            this.nodeService.remove(this.node._id).then(success => {
                if(success) {
                    this.onRemoveSuccess();
                }
            });
        }
        else {
            this.onRemoveSuccess();
        }
    }

    onRemoveSuccess() {
        this.appService.notify(new RemoveNodeEvent(this.node));
        this.remove.emit(this.node);
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
                    if(node._id) {
                        this.appService.notify(new CloseFooterModalEvent(null));
                    }
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
        if(this.inputs.length > 0) {
            var yRadius = 250, 
                xRadius = this.node.ntype === NodeType.Strategy ? PlatformUI.canvas.center.x * .55 : 160, 
                angleOffset = 12, startAngle = 180;
            var prevAngle: number;

            if(!animating) {
                startAngle += (this.inputs.length - 1) * (angleOffset / 2); //only needed when not animating
            }

            var firstNode = true;
            this.inputs.forEach(node => {
                switch(node.ntype) {
                    case NodeType.Strategy:
                        node.position = { x: PlatformUI.canvas.center.x, y: PlatformUI.canvas.center.y };
                        break;
                    default:
                        var angle = firstNode ? startAngle : (prevAngle - angleOffset);
                        prevAngle = angle;
                        firstNode = false;

                        node.position = {
                            x: xRadius * Math.cos(angle / 180 * Math.PI) + this.node.position.x,
                            y: yRadius * Math.sin(angle / 180 * Math.PI) + this.node.position.y
                        };
                        break;
                }

                this.setNodeLine(node);
                this.appService.notify(new RedrawNodeEvent(node._id));
            });
        }
    }

    setNodeLine(node: Node) {
        var centerX = PlatformUI.canvas.center.x;
        var centerY = PlatformUI.canvas.center.y;
        var x1: number = node.position.x;
        var y1: number = node.position.y; 
        var x2: number, y2: number;

        switch(node.ntype) {
            case NodeType.Strategy:
                x2 = (centerX * 2) * .9 - 50;
                y2 = centerY;
                break;
            default:
                x2 = this.node.position.x; 
                y2 = this.node.position.y;
                break;
        }

        node['line'] = Common.getLine(x1, y1, x2, y2);
    }
}