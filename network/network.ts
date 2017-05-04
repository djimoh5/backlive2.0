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

import { NetworkLayerNode } from './node/layer.node';

import { BaseDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';
import { MNISTLoaderNode } from './node/data/mnist-loader.node';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

import { ICostFunction, CostFunctionType, CostFunctionFactory } from './lib/cost-function';
import { ProcessWrapper } from './process-wrapper';

export class Network {
    network: NetworkModel;
    nodes:  NodeMap<BaseNode<any>> = {};
    hiddenLayers: NetworkLayerNode[] = [];
    private networkService: NetworkService;

    dataNode: BaseDataNode;
    executionNode: IExecutionNode;

    activityState: number = 0;
    onIdle: () => void;

    subscriberName: string = 'network';

    costFunctionType: CostFunctionType =  CostFunctionType.Quadratic;
    static costFunction: ICostFunction;
    static isLearning: boolean = true;
    epochCount: number = 0;

    multiProcess: boolean = false;
    maxProcesses: number;
    processes: ProcessWrapper[] = [];
    startTime: number;
    prevStartTime: number;

    static timings: NetworkTimings;

    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(LoadNetworkEvent, this.subscriberName, event => this.loadNetwork(event.data));
        AppEventQueue.subscribe(ExecuteNetworkEvent, this.subscriberName, event => this.executeNetwork(event.data));
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights(event.data));

        Database.open(() => {
            console.log('Database opened');
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new MNISTLoaderNode(); //new DataLoaderNode();
            this.createNetwork();
        });
    }

    loadNode(node: Node) {
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

    updateInputNodes(node: Node, inputNodes: Node[]) {
        if(node.ntype === NodeType.Strategy && this.network.hiddenLayers.length > 0 && this.network.hiddenLayers[0].numNodes > 0) {
            this.insertHiddenLayer(node, inputNodes);
        }
        else {
            inputNodes.forEach(input => {
                var inputNode: BaseNode<any> = this.nodes[input._id] ? this.nodes[input._id] : this.loadNode(input);
                inputNode.updateOutput(node);
            });
        }

        this.activity(false);
    }

    insertHiddenLayer(outputNode: Node, inputNodes: Node[]) {
        var baseNode = this.nodes[outputNode._id];
        outputNode.inputs = [];

        var hiddenLayer = new NetworkLayerNode(this.network.hiddenLayers[0].numNodes);
        hiddenLayer.setInputs(inputNodes);
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

        if(this.network._id) {
            this.networkService = new NetworkService({ user: { uid: network.uid }, cookies: null });
            this.networkService.getInputs(network._id).then(nodes => {
                this.loadNode(nodes[0]);
            });
        }
    }

    executeNetwork(network: NetworkModel) {
        this.onIdle = () => {
            this.printNetwork();

            if(this.multiProcess) {
                this.initProcesses();
                var pendingProcesses = 0;
                var numProcesses = 0;

                AppEventQueue.unsubscribe(this.subscriberName, NodeProcessReadyEvent);
                AppEventQueue.subscribe(NodeProcessReadyEvent, this.subscriberName, event => {
                    console.log('process for node', event.data, 'ready');
                    if(--pendingProcesses === 0) {
                        this.startTime = Date.now();
                        AppEventQueue.notify(new InitializeDataEvent(null));
                    }
                });

                for(var key in this.nodes) {
                    if(this.nodes[key].numOutputs() > 0) {
                        pendingProcesses++;
                        this.nodes[key].useProcess(this.processes[numProcesses++ % this.maxProcesses]); 
                    }
                }
            }
            else {
                this.startTime = Date.now();
                AppEventQueue.notify(new InitializeDataEvent(null));
            }

            this.prevStartTime = this.startTime;
        };

        Network.isLearning = true;
        Network.timings = new NetworkTimings();
        this.loadNetwork(network);
    }

    createNetwork() {
        this.dataNode.load(trainingData => {
            //console.log(this.trainingData);
            console.log(trainingData.input.length);
            console.log(trainingData.output.length, trainingData.output[0]);
            this.network = new NetworkModel(.5, 50, [100], 1);
            this.executeNetwork(this.network); //call this first to init and reset network
            
            var inputNode = this.dataNode.getNode();
            var hiddenLayer = new NetworkLayerNode(this.network.hiddenLayers[0].numNodes);
            hiddenLayer.setInputs([inputNode]);

            var outputLayer = new NetworkLayerNode(trainingData.output[0].length);
            outputLayer.setInputs(hiddenLayer.nodes);

            this.nodes[inputNode._id] = this.dataNode;
            outputLayer.nodes.forEach(output => {
                this.loadNode(output);
            });
        });
    }

    initProcesses() {
        this.processes.forEach(process => {
            process.kill();
        });

        this.maxProcesses = require('os').cpus().length;
        this.processes = [];
                
        for(var i = 0; i < this.maxProcesses; i++) {
            this.processes[i] = new ProcessWrapper();
        }
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
        this.processes.forEach(process => process.clearProcessedEvents());

        if(this.epochCount++ < this.network.epochs) {
            AppEventQueue.notify(new UpdateNodeWeightsEvent(this.network.learnRate));
            console.log('completed epoch', this.epochCount);
            console.log('epoch time:', ((Date.now() - this.prevStartTime) / 1000) + 's');
            console.log('epoch timings:', JSON.stringify(Network.timings));

            //run another epoch
            Network.timings = new NetworkTimings();
            AppEventQueue.notify(new InitializeDataEvent(null));
        }
        else {
            if(!validating) {
                Network.isLearning = false;
                Network.timings = new NetworkTimings();
                AppEventQueue.notify(new ValidateDataEvent(null));
            }
            else {
                console.log('validation complete');
                console.log('total time:', ((Date.now() - this.startTime) / 1000) + 's');
                console.log(JSON.stringify(Network.timings));
            }
        }

        this.prevStartTime = Date.now();
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

export class NetworkTimings  {
    data: number = 0;
    event: number = 0; 
    activation: number = 0;
    indicatorActivation: number = 0;
    backpropagation: number = 0;
    weight: number = 0;
}

process.on('uncaughtException', function (exception) {
  console.log(exception);
  throw(exception);
});