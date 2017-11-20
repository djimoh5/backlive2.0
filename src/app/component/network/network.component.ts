import { Component, OnInit, OnDestroy } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';
import { SearchBarComponent } from 'backlive/component/shared/ui';
import { NetworkListComponent } from './shared/list/list.component';
import { SlidingNavItem } from 'backlive/component/navigation';

import { AppService, UserService, NetworkService, BasicNodeService, LookupService, RouterService } from 'backlive/service';

import { Route } from 'backlive/routes';
import { Network, Portfolio, Node, NodeType } from 'backlive/service/model';
import { NodeChangeEvent, ActivateNodeEvent, ExecuteStrategyEvent, ExecuteNetworkEvent, LoadNetworkEvent, RedrawNodeEvent } from 'backlive/event';

import { PlatformUI } from 'backlive/utility/ui';

import { Common, Cache } from 'backlive/utility';

declare var d3;

@Component({
    selector: 'backlive-network',
    templateUrl: 'network.component.html',
    styleUrls: ['network.component.less']
})
export class NetworkComponent extends PageComponent implements OnInit, OnDestroy {
    network: Network;
    eventLoop: any;
    life: { numLoops: number };
    navItems: SlidingNavItem[];
    
    errMessage: string;
    nodes: Node[] = [];

    NodeType = NodeType;
    tmpInputMap: { [key: string]: { node: Node, input: Node } } = {};

    todayDate: number;
    minStartDate: number = 20030103;

    constructor(appService: AppService, private userService: UserService, private lookupService: LookupService, private platformUI: PlatformUI, 
        private nodeService: BasicNodeService, private networkService: NetworkService, private routerService: RouterService) {
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
        this.setCanvas();

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

        console.log('nodes', this.nodes);

        this.networkService.list().then(networks => {
            console.log('nodesjj', this.nodes);
            
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
                var network = new Network(.5, 50, 100, null, [5]);
                this.networkService.update(network).then(network => {                  
                    this.loadNetwork(network);
                });
            }

            this.startEventLoop();
        });
    }

    update() {
        this.networkService.update(this.network);
    }

    updateHiddenLayers(str: string) {
        this.network.hiddenLayers = str.split(',').map(s => { return parseInt(s); });
        this.update();
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

        var index = this.nodes.findIndex(n => { return n._id === node._id; });
        if(index >= 0) {
            this.nodes[index] = node;
        }
        else {
            this.nodes.push(node);
        }
    }

    onLoadInputs(node: Node, inputNodes: Node[]) {
        inputNodes.forEach(node => {
            this.loadNode(node);
        });
    }

    onAddInput(node: Node, inputNode: Node) {
        this.nodes.push(inputNode);
        this.tmpInputMap[node._id] = { node: node, input: inputNode };

        if(inputNode._id) {
            this.onNodeChange(inputNode);
        }
    }

    onNodeChange(node: Node) {
        for(var key in this.tmpInputMap) {
            if(this.tmpInputMap[key].input === node) {
                if(!this.tmpInputMap[key].node.inputs) {
                    this.tmpInputMap[key].node.inputs = [];
                }

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
        if(this.network && this.network.inputs) {
            this.setCanvas();
            this.appService.notify(new RedrawNodeEvent(this.network.inputs[0]));
        }
    }

    setCanvas() {
        PlatformUI.canvas = { 
            center: { 
                x: this.platformUI.query(window).width() / 2,
                y: this.platformUI.query(window).height() / 2 
            }
        };
    }

    getActivationLine(node: Node) {
        if(!node['aline']) {
            var path = this.platformUI.query('path[id="path' + node._id + '"]')[0];
            var pathLen = path.getTotalLength();

            var interval = pathLen / 30;
            var newLen  = 0;
            var p1 = path.getPointAtLength(newLen);
            var p2 = path.getPointAtLength(newLen + interval);
            node['aline'] = Common.getLine(p1.x, p1.y, p2.x, p2.y);

            var activating = setInterval(() => {
                var p1 = path.getPointAtLength(newLen);
                var p2 = path.getPointAtLength(newLen + (interval * 2));
                node['aline'] = Common.getLine(p1.x, p1.y, p2.x, p2.y);

                newLen += interval;

                if(newLen > pathLen) {
                    clearInterval(activating);
                    node['activating'] = null;
                }
            }, 16);
        }

        return node['aline'];
    }

    toDate(sliderVal: number) {
        return Math.round(this.minStartDate + ((this.todayDate - this.minStartDate) / 100 * sliderVal));
    }

    toSliderVal(date: number) {
        return (date - this.minStartDate) / (this.todayDate - this.minStartDate) * 100;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        clearInterval(this.eventLoop);
    }
}