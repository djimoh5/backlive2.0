/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { NetworkService } from '../core/service/network.service';
import { VirtualNodeService } from './node/basic/virtual-node.service';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

import { InitializeDataEvent, EpochCompleteEvent, UpdateNodeWeightsEvent, ValidateDataEvent, ActivateNodeEvent } from './event/app.event';

import { NodeConfig } from './node/node.config';
import { Node, NodeType } from '../core/service/model/node.model';
import { Network as NetworkModel } from '../core/service/model/network.model';
import { NodeChangeEvent } from '../app/component/node/node.event';
import { LoadNetworkEvent, ExecuteNetworkEvent } from '../app/component/network/network.event';

import { IDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

import { ICostFunction, QuadraticCost, /*CrossEntropyCost*/ } from './lib/cost-function';

import { Common } from '../app//utility/common';

export class Network {
    network: NetworkModel;
    nodes:  NodeMap<BaseNode<any>> = {};
    private networkService: NetworkService;

    dataNode: IDataNode;
    executionNode: IExecutionNode;

    activityState: number = 0;
    onIdle: () => void;

    subscriberName: string = 'network';

    static costFunction: ICostFunction;
    static isLearning: boolean = true;
    epochCount: number = 0;

    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(NodeChangeEvent, this.subscriberName, event => this.loadNode(event.data));
        AppEventQueue.subscribe(LoadNetworkEvent, this.subscriberName, event => this.loadNetwork(event.data));
        AppEventQueue.subscribe(ExecuteNetworkEvent, this.subscriberName, event => this.executeNetwork(event.data));
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights(event.data));

        Database.open(() => {
            console.log('Database opened');
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new DataLoaderNode();
        });
    }

    loadNode(node: Node, inputNodes?: { [key: string]: Node }) { //inputNodes only used for virtual nodes
        this.activity(true);

        if(!this.nodes[node._id]) {
            this.nodes[node._id] = new (NodeConfig.node(node.ntype))(node);
            this.nodes[node._id].onUpdateInputs = (inputNodes) => this.updateInputNodes(node, inputNodes);

            if(node.ntype === NodeType.Virtual) {
                VirtualNodeService.save(node, inputNodes);
            }
        }
        else {
            this.nodes[node._id].setNode(node);
            this.nodes[node._id].onUpdateInputs = (inputNodes) => this.updateInputNodes(node, inputNodes);
        }

        return this.nodes[node._id];
    }

    updateInputNodes(node: Node, inputNodes: { [key: string]: Node }) {
        if(node.ntype === NodeType.Strategy && this.network.hiddenLayers.length > 0) {
            this.createVirtualNodes(node, inputNodes);
        }
        else {
            for(var key in inputNodes) {
                var inputNode: BaseNode<any> = this.loadNode(inputNodes[key]);
                inputNode.updateOutput(node);
            }
        }

        this.activity(false);
    }

    createVirtualNodes(node: Node, inputNodes: { [key: string]: Node }) {
        var baseNode = this.nodes[node._id];
        var inputs = node.inputs;
        node.inputs = [];

        var hiddenNodes: Node[] = [];
        for(var i = 0; i < this.network.hiddenLayers[0].numNodes; i++) {
            var model = new Node(NodeType.Virtual);
            model._id = Common.uniqueId();
            model.name = 'hidden' + (i + 1);
            model.inputs = inputs;

            hiddenNodes.push(model);
            node.inputs.push(model._id);

            this.loadNode(model, inputNodes).updateOutput(node);
        }

        baseNode.updateInputs(hiddenNodes);
    }

    loadNetwork(network: NetworkModel) {
        this.network = network;
        this.epochCount = 0;

        Network.costFunction = new QuadraticCost();
        VirtualNodeService.reset();

        for(var id in this.nodes) {
            if(this.nodes[id].getNode().ntype === NodeType.Virtual) {
                this.nodes[id].unsubscribe(null);
                delete this.nodes[id];
            }
        }
        
        this.networkService = new NetworkService({ user: { uid: network.uid }, cookies: null });
        this.networkService.getInputs(network._id).then(nodes => {
            this.loadNode(nodes[0]);
        });
    }

    executeNetwork(network: NetworkModel) {
        this.onIdle = () => {
            this.printNetwork();
            AppEventQueue.notify(new InitializeDataEvent(null)); 
        };

        Network.isLearning = true;
        this.loadNetwork(network);
    }

    printNetwork() {
        console.log(this.network);
        this.print(this.nodes[this.network.inputs[0]], 0);
    }

    print<T extends Node>(baseNode: BaseNode<T>, level: number) {
        level++;
        var node = baseNode.getNode();
        console.log(level, " - ", node._id, node.weights);

        if(node.inputs) {
            node.inputs.forEach(nid => {
                this.print(this.nodes[nid], level);
            });
        }
    }

    updateNodeWeights(validating: boolean) {
        ActivateNodeEvent.isSocketEvent = false;

        if(this.epochCount++ < this.network.epochs) {
            AppEventQueue.notify(new UpdateNodeWeightsEvent(this.network.learnRate));
            console.log('completed epoch', this.epochCount);

            //run another epoch
            AppEventQueue.notify(new InitializeDataEvent(null));
        }
        else {
            if(!validating) {
                Network.isLearning = false;
                AppEventQueue.notify(new ValidateDataEvent(null));
            }
            else {
                console.log('validation complete');
            }

            this.printNetwork();
        }
    }

    private activity(active: boolean) {
        if(active) { this.activityState++; }
        else { this.activityState--; }

        //console.log('activity state:', this.activityState);
        if(this.activityState === 0 && this.onIdle) {
            this.onIdle();
            this.onIdle = null;
        }
    }
}

interface NodeMap<T> {
    [key: string]: T;
}