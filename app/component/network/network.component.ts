import { Component, OnInit, OnDestroy } from '@angular/core';
import { Path } from 'backlive/config';
import { PageComponent, SearchBarComponent } from 'backlive/component/shared';
import { NetworkListComponent } from './shared/list/list.component';
import { SlidingNavItem } from 'backlive/component/navigation';

import { AppService, UserService, NetworkService, BasicNodeService, IndicatorService, StrategyService, PortfolioService, LookupService, RouterService } from 'backlive/service';
import { NodeService } from '../../service/node.service';

import { Route } from 'backlive/routes';
import { Network, Portfolio, Node, NodeType } from 'backlive/service/model';
import { NodeChangeEvent, ActivateNodeEvent, ExecuteStrategyEvent, ExecuteNetworkEvent, LoadNetworkEvent } from 'backlive/event';

import { PlatformUI } from 'backlive/utility/ui';

import { Common, Cache } from 'backlive/utility';

declare var d3;

@Component({
    selector: 'backlive-network',
    templateUrl: Path.ComponentView('network'),
    styleUrls: [Path.ComponentStyle('network')]
})
export class NetworkComponent extends PageComponent implements OnInit, OnDestroy {
    network: Network;
    eventLoop: any;
    life: { numLoops: number };
    navItems: SlidingNavItem[];
    
    errMessage: string;
    nodes: Node[] = [];
    indicatorSize = { width: 38, height: 34 };

    NodeType = NodeType;
    tmpInputMap: { [key: string]: { node: Node, input: Node } } = {};

    todayDate: number;
    minStartDate: number = 20030103;

    constructor(appService: AppService, private userService: UserService, private lookupService: LookupService, private platformUI: PlatformUI, 
        private nodeService: BasicNodeService, private networkService: NetworkService, private indicatorService: IndicatorService, private strategyService: StrategyService, 
        private portfolioService: PortfolioService, private routerService: RouterService) {
        super(appService);

        this.todayDate = Common.dbDate(new Date());
        
        this.navItems = [
            { icon: 'search', component: SearchBarComponent },
            { icon: 'list', component: NetworkListComponent, eventHandlers: { select: (node: Network) => this.loadNetwork(node) }, tooltip: 'my strategies' },
            { icon: "settings", component: null }
        ];
        
        this.life = { numLoops: 0 };
        this.lookupService.getDataFields(); //just to cache data

        this.platformUI.onResize('network', size => this.positionNodes()); 

        this.subscribeEvent(ActivateNodeEvent, event => {
            this.activate(event);
        });

        this.subscribeEvent(ExecuteStrategyEvent, () => { 
            this.appService.notify(new ExecuteNetworkEvent(this.network));
        });
    }

    ngOnInit() {
        var id = this.routerService.params('id');
        if(!id) {
            id =  Cache.get('strategyId', 'pref');
        }

        this.networkService.list().then(networks => {
            if(networks.length > 0) {
                var n: Network;
                if(id) {
                    n = networks.filter((network) => { return network._id === id; })[0];
                }

                if(!n) {
                    n = networks[0];
                }

                this.loadNetwork(n);
            }
            else {
                var network = new Network(.5, 50, [3], null);
                this.networkService.update(network).then(network => {
                    this.loadNode(network);
                });
            }

            this.startEventLoop();
        });
    }

    update() {
        this.networkService.update(this.network);
    }

    loadNetwork(network: Network) {
        this.network = network;
        this.nodes = [];
        this.networkService.getInputs(network._id).then(nodes => {
            if(nodes.length > 0) {
                this.loadNode(nodes[0]);
                this.appService.notify(new LoadNetworkEvent(network));
            }
            else {
                this.onAddInput(this.network, new Portfolio());
            }      
        });

        this.appService.navigate(Route.Strategy, { id: this.network._id });
        Cache.set('strategyId', network._id, 0, 'pref');
    }

    loadNode<T extends Node>(node: Node) {
        node['activating'] = node['activated'] = false;
        this.nodes.push(node);
        this.positionNodes();

        if(node._id) {
            var service: NodeService<Node>;

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

        if(node.ntype === NodeType.Strategy && node.name !== this.network.name) {
            this.network.name = node.name;
            this.networkService.update(this.network);
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