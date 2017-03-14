/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { NetworkService } from '../core/service/network.service';
import { VirtualNodeService } from './node/basic/virtual-node.service';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

import { NodeProcessReadyEvent, InitializeDataEvent, EpochCompleteEvent, UpdateNodeWeightsEvent, ValidateDataEvent, ActivateNodeEvent } from './event/app.event';

import { NodeConfig } from './node/node.config';
import { Node, NodeType } from '../core/service/model/node.model';
import { Network as NetworkModel } from '../core/service/model/network.model';
import { LoadNetworkEvent, ExecuteNetworkEvent } from '../app/component/network/network.event';

import { HiddenLayerNode } from './node/hidden-layer.node';

import { IDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

import { ICostFunction, CostFunctionType, CostFunctionFactory } from './lib/cost-function';

export class Network {
    network: NetworkModel;
    nodes:  NodeMap<BaseNode<any>> = {};
    hiddenLayers: HiddenLayerNode[] = [];
    private networkService: NetworkService;

    dataNode: IDataNode;
    executionNode: IExecutionNode;

    activityState: number = 0;
    onIdle: () => void;

    subscriberName: string = 'network';

    costFunctionType: CostFunctionType =  CostFunctionType.Quadratic;
    static costFunction: ICostFunction;
    static isLearning: boolean = true;
    epochCount: number = 0;

    multiProcess: boolean = false;
    startTime: number;

    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(LoadNetworkEvent, this.subscriberName, event => this.loadNetwork(event.data));
        AppEventQueue.subscribe(ExecuteNetworkEvent, this.subscriberName, event => this.executeNetwork(event.data));
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights(event.data));

        Database.open(() => {
            console.log('Database opened');
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new DataLoaderNode();
        });
    }

    loadNode(node: Node) { //inputNodes only used for virtual nodes
        this.activity(true);

        if(!this.nodes[node._id]) {
            this.nodes[node._id] = new (NodeConfig.node(node.ntype))(node);
        }
        else {
            this.nodes[node._id].setNode(node);
        }

        this.nodes[node._id].onUpdateInputs = (inputNodes) => this.updateInputNodes(node, inputNodes);

        return this.nodes[node._id];
    }

    updateInputNodes(node: Node, inputNodes: { [key: string]: Node }) {
        if(node.ntype === NodeType.Strategy && this.network.hiddenLayers.length > 0 && this.network.hiddenLayers[0].numNodes > 0) {
            this.createHiddenLayer(node, inputNodes);
        }
        else {
            for(var key in inputNodes) {
                var inputNode: BaseNode<any> = this.nodes[key] ? this.nodes[key] : this.loadNode(inputNodes[key]);
                inputNode.updateOutput(node);
            }
        }

        this.activity(false);
    }

    createHiddenLayer(outputNode: Node, inputNodes: { [key: string]: Node }) {
        var baseNode = this.nodes[outputNode._id];
        outputNode.inputs = [];

        var hiddenLayer = new HiddenLayerNode(this.network.hiddenLayers[0], inputNodes);
        hiddenLayer.nodes.forEach(n => {
            outputNode.inputs.push(n._id);
            this.loadNode(n).updateOutput(outputNode);
        });

        hiddenLayer.updateOutput(outputNode);
        this.hiddenLayers.push(hiddenLayer);

        baseNode.updateInputs(hiddenLayer.nodes);
    }

    loadNetwork(network: NetworkModel) {
        this.network = network;
        this.epochCount = 0;

        Network.costFunction = CostFunctionFactory.create(this.costFunctionType);
        VirtualNodeService.reset();

        for(var id in this.nodes) {
            this.nodes[id].unsubscribe();
            delete this.nodes[id];
        }

        this.hiddenLayers.forEach(layer => { layer.unsubscribe(); });
        this.hiddenLayers = [];

        this.networkService = new NetworkService({ user: { uid: network.uid }, cookies: null });
        this.networkService.getInputs(network._id).then(nodes => {
            this.loadNode(nodes[0]);
        });
    }

    executeNetwork(network: NetworkModel) {
        this.onIdle = () => {
            this.printNetwork();

            if(this.multiProcess) {
                var numProcesses = 0;

                AppEventQueue.unsubscribe(this.subscriberName, NodeProcessReadyEvent);
                AppEventQueue.subscribe(NodeProcessReadyEvent, this.subscriberName, event => {
                    console.log('process for node', event.data, 'ready');
                    if(--numProcesses === 0) {
                        this.startTime = (new Date()).getTime();
                        AppEventQueue.notify(new InitializeDataEvent(null));
                    }
                });

                for(var key in this.nodes) {
                    numProcesses++;
                    this.nodes[key].initProcess(this.costFunctionType); 
                }
            }
            else {
                AppEventQueue.notify(new InitializeDataEvent(null)); 
            }  
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
                console.log('total time:', (((new Date()).getTime() - this.startTime) / 1000) + 's');
            }
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