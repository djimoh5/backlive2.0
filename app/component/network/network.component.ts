import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Path } from 'backlive/config';
import { PageComponent, SearchBarComponent } from 'backlive/component/shared';
import { StrategyComponent } from '../strategy/strategy.component';

import { AppService, UserService, StrategyService, LookupService } from 'backlive/service';

import { Route } from 'backlive/routes';
import { Strategy, Indicator, Node, NodeType } from 'backlive/service/model';
import { SlidingNavItemsEvent, LoadNodeEvent, NodeChangeEvent } from 'backlive/event';

import { PlatformUI } from 'backlive/utility/ui';

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
    indicatorSize = { width: 36, height: 32 };

    NodeType = NodeType;
    tmpInputMap: { [key: string]: { node: Node, input: Node } } = {};

    constructor(appService: AppService, private userService: UserService, private strategyService: StrategyService, private lookupService: LookupService, private platformUI: PlatformUI) {
        super(appService);
        
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
    }
    
    ngOnInit() {
        this.strategyService.list().then(strategies => {
            //console.log('strategies', strategies);
            if(strategies.length > 0) {
                this.loadStrategy(strategies[0]);
            }
            else {
                this.loadStrategy(new Strategy(''));
            }

            this.startEventLoop();
        });
    }

    loadStrategy(strategy: Strategy) {
        this.strategy = strategy;
        this.nodes.push(this.strategy);

        if(strategy._id) {
            this.strategyService.getInputs(strategy._id).then(nodes => {
                strategy.inputs = [];
                nodes.forEach(node => {
                    strategy.inputs.push(node._id); //in case there are any deleted nodes still in inputs
                    this.nodes.push(node);
                });

                this.positionNodes();
                this.appService.notify(new LoadNodeEvent(strategy));
            });
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

        if(!animating) { //-2 because strategy is also a node
            startAngle += (this.nodes.length - 2) * (angleOffset / 2); //only needed when not animating
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
        });
    }
    
    getLine(indicator: Indicator) {
        var centerX = this.platformUI.query(window).width() / 2;
        var centerY = this.platformUI.query(window).height() / 2;
        
        var lineData = [
           { 
             x: centerX + (centerX * 2 * indicator.position.x / 100), 
             y: centerY + indicator.position.y + (this.indicatorSize.height / 2)
           },  
           { x: centerX, y: centerY - 30 }
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