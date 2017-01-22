import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Path } from 'backlive/config';
import { PageComponent, SearchBarComponent } from 'backlive/component/shared';
import { StrategyComponent } from '../strategy/strategy.component';

import { AppService, UserService, BasicNodeService, IndicatorService, StrategyService, PortfolioService, LookupService } from 'backlive/service';
import { NodeService } from '../../service/node.service';

import { Route } from 'backlive/routes';
import { Strategy, Indicator, Portfolio, Node, NodeType } from 'backlive/service/model';
import { SlidingNavItemsEvent, LoadNodeEvent, NodeChangeEvent, ActivateNodeEvent } from 'backlive/event';

import { PlatformUI } from 'backlive/utility/ui';

import { Common } from 'backlive/utility';

declare var d3;

@Component({
    selector: 'backlive-network',
    templateUrl: Path.ComponentView('network'),
    styleUrls: [Path.ComponentStyle('network')]
})
export class NetworkComponent extends PageComponent implements OnInit, OnDestroy {
    eventLoop: any;
    life: { numLoops: number };
    
    errMessage: string;
    nodes: Node[] = [];
    strategy: Strategy;
    indicatorSize = { width: 38, height: 34 };

    NodeType = NodeType;
    tmpInputMap: { [key: string]: { node: Node, input: Node } } = {};

    startSliderVal: number;
    endSliderVal: number;
    todayDate: number;
    minStartDate: number = 20030103;

    constructor(appService: AppService, private userService: UserService, private lookupService: LookupService, private platformUI: PlatformUI, 
        private nodeService: BasicNodeService, private indicatorService: IndicatorService, private strategyService: StrategyService, private portfolioService: PortfolioService) {
        super(appService);

        this.todayDate = Common.dbDate(new Date());
        this.startSliderVal = this.toSliderVal(20080101);
        this.endSliderVal = this.toSliderVal(20160101);
        
        var items = [
            { icon: "search", component: SearchBarComponent },
            { icon: "video", onClick: () => {}, tooltip:'test' },
            { icon: "list", onClick: () => {} },
            { icon: "settings", component: null }
        ];
        
        appService.notify(new SlidingNavItemsEvent(items));

        this.life = { numLoops: 0 };
        this.lookupService.getDataFields(); //just to cache data

        this.platformUI.onResize('network', size => this.positionNodes()); 

        this.subscribeEvent(ActivateNodeEvent, event => {
            this.activate(event);
        });
    }

    activate(event: ActivateNodeEvent) {
        var actCnt = 0;
        var activatedNode: Node;
        
        this.nodes.forEach(node => {
            if(node['activating']) {
                setTimeout(() => {
                    node['activating'] = event.senderId === node._id;
                    node['a-line'] = null;
                }, 500);
            }
            else {
                node['activating'] = event.senderId === node._id;
                if(node['activating']) {
                    activatedNode = node;
                    node['activated'] = node['activated'] ? ++node['activated'] : 1;
                }
            }

            if(node['activated']) {
                actCnt += node['activated'];
            }
        });

        if(actCnt > this.nodes.length) {
            this.nodes.forEach(node => {
                node['activated'] = node._id !== activatedNode._id ? 0 : 1;
            });
        }
    }
    
    ngOnInit() {
        this.portfolioService.list().then(portfolios => {
            if(portfolios.length > 0) {
                this.loadNode(portfolios[0], true);
            }
            else {
                this.loadNode(new Portfolio());
            }

            this.startEventLoop();
        });
    }

    loadNode<T extends Node>(node: Node, isOutput: boolean = false) {
        node['activating'] = node['activated'] = false;
        this.nodes.push(node);
        this.positionNodes();

        if(node._id) {
            var service: NodeService<Strategy | Portfolio>;

            switch(node.ntype) {
                case NodeType.Basic: service = this.nodeService;
                    break;
                case NodeType.Indicator: service = this.indicatorService;
                    break;
                case NodeType.Strategy: service = this.strategyService;
                    break;
                case NodeType.Portfolio: service = this.portfolioService;
                    break;
            }

            if(node.inputs) {
                service.getInputs(node._id).then(nodes => {
                    if(nodes.length > 0) {
                        node.inputs = []; //in case there are any deleted nodes still in inputs
                        nodes.forEach(n => {
                            node.inputs.push(n._id);
                            this.loadNode(n);
                        });
                    }
                    else {
                        delete node.inputs;
                        delete node.weights;
                    }

                    if(isOutput) {
                        this.appService.notify(new LoadNodeEvent(node));
                    }
                });
            }
        }
    }

    onAddInput(node: Node, inputNode: Node) {
        if(!node.inputs) {
            node.inputs = [];
        }

        this.nodes.push(inputNode);
        this.tmpInputMap[node._id] = { node: node, input: inputNode };

        this.positionNodes();
    }

    onNodeChange(node: Node, index: number = null) {
        for(var key in this.tmpInputMap) {
            if(this.tmpInputMap[key].input === node) {
                this.tmpInputMap[key].node.inputs.push(node._id);
                this.appService.notify(new NodeChangeEvent(this.tmpInputMap[key].node));
                delete this.tmpInputMap[key];
            }
        }
    }

    onRemoveNode(node: Node, index: number = null) {
        this.nodes.splice(index, 1);
        this.nodes.forEach(n => {
            if(n.inputs) {
                var index = n.inputs.indexOf(node._id);
                if(index >= 0) {
                    n.inputs.splice(index, 1);
                    this.appService.notify(new NodeChangeEvent(n));
                }
            }
        });

        this.positionNodes();
    }

    startEventLoop() {
        this.eventLoop = true;
        /*this.eventLoop = setInterval(() => {
            var numInds = this.nodes.length - 1;

            if(numInds > 0) {
                //this.positionNodes(true);
                //this.life.numLoops++;
            }
        }, 200);*/
    }

    positionNodes(animating: boolean = false) {
        var radius = 250, radiusPercent = 40, angleOffset = 10, startAngle = 180;
        var prevAngle: number;

        if(!animating) { //-3 because strategy and portfolio are also nodes
            startAngle += (this.nodes.length - 3) * (angleOffset / 2); //only needed when not animating
        }

        var firstNode = true;
        this.nodes.forEach(node => {
            if(node.ntype === NodeType.Indicator) {
                var angle = firstNode ? (startAngle + (.2 * this.life.numLoops)) : (prevAngle - angleOffset);
                prevAngle = angle;
                firstNode = false;

                node.position = {
                    x: radiusPercent * Math.cos(angle / 180 * Math.PI),
                    y: radius * Math.sin(angle / 180 * Math.PI) - (this.indicatorSize.height / 2) - 30 //extra 30 for amount strategy pod is off center;
                };
            }

            node['line'] = null;
        });
    }

    toDate(sliderVal: number) {
        return Math.round(this.minStartDate + ((this.todayDate - this.minStartDate) / 100 * sliderVal));
    }

    toSliderVal(date: number) {
        return (date - this.minStartDate) / (this.todayDate - this.minStartDate) * 100;
    }
    
    getNodeLine(node: Node) {
        if(!node['line']) {
            var centerX = this.platformUI.query(window).width() / 2;
            var centerY = this.platformUI.query(window).height() / 2;
            
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

            node['line'] = this.getLine(x1, y1, x2, y2);
        }

        return node['line'];
    }

    getActivationLine(node: Node) {
        if(!node['a-line']) {
            var path = this.platformUI.query('path[id="path' + node._id + '"]')[0];
            var pathLen = path.getTotalLength();

            var interval = pathLen / 30;
            var newLen  = 0;
            var p1 = path.getPointAtLength(newLen);
            var p2 = path.getPointAtLength(newLen + interval);
            node['a-line'] = this.getLine(p1.x, p1.y, p2.x, p2.y);

            var activating = setInterval(() => {
                var p1 = path.getPointAtLength(newLen);
                var p2 = path.getPointAtLength(newLen + (interval * 2));
                node['a-line'] = this.getLine(p1.x, p1.y, p2.x, p2.y);

                newLen += interval;

                if(newLen > pathLen) {
                    clearInterval(activating);
                    node['activating'] = null;
                }
            }, 16);
        }

        return node['a-line'];
    }
    
    getLine(x1: number, y1: number, x2: number, y2: number) {
        var lineData = [
            { x: x1, y: y1 },  
            { x: x2, y: y2 }
        ];
        
        var line = d3.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .curve(d3.curveBundle.beta(1));

       return line(lineData);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        clearInterval(this.eventLoop);
    }
}