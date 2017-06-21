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

    costFunctionType: CostFunctionType =  CostFunctionType.CrossEntropy;
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
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights());

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
            inputNodes.forEach((input, index) => {     
                var inputNode: BaseNode<any> = this.loadNode(input);
                inputNode.updateOutput(node);
                inputNode.layerIndex = index;
            });
        }

        this.activity(false);
    }

    insertHiddenLayer(outputNode: Node, inputNodes: Node[]) {
        var baseNode = this.nodes[outputNode._id];
        outputNode.inputs = [];

        var hiddenLayer = new NetworkLayerNode(this.network.hiddenLayers[0].numNodes);
        hiddenLayer.setInputs(inputNodes);
        hiddenLayer.nodes.forEach((n, index) => {
            outputNode.inputs.push(n._id);
            var node = this.loadNode(n);
            node.updateOutput(outputNode);
            node.layerIndex = index;
        });

        hiddenLayer.updateOutput(outputNode);
        this.hiddenLayers.push(hiddenLayer);

        baseNode.updateInputs(hiddenLayer.nodes);
    }

    resetNetwork() {
        Network.isLearning = true;
        Network.timings = new NetworkTimings();
        this.epochCount = 0;

        Network.costFunction = CostFunctionFactory.create(this.costFunctionType);
        VirtualNodeService.reset();

        for(var id in this.nodes) {
            this.nodes[id].unsubscribe();
            delete this.nodes[id];
        }

        this.hiddenLayers.forEach(layer => { layer.unsubscribe(); });
        this.hiddenLayers = [];
    }

    loadNetwork(network: NetworkModel, rootNode: Node = null) {
        if(!rootNode) {
            this.resetNetwork();
        }

        this.network = network;

        if(rootNode) {
            this.loadNode(rootNode);
        }
        else {
            this.networkService = new NetworkService({ user: { uid: network.uid }, cookies: null });
            this.networkService.getInputs(network._id).then(nodes => {
                this.loadNode(nodes[0]);
            });
        }
    }

    executeNetwork(network: NetworkModel, rootNode: Node = null) {
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

                this.prevStartTime = this.startTime;
            }
            else {
                this.startTime = Date.now();
                this.prevStartTime = this.startTime;
                AppEventQueue.notify(new InitializeDataEvent(null));
            }
        };

        this.loadNetwork(network, rootNode);
    }

    createNetwork() {
        this.dataNode.load(trainingData => {
            this.resetNetwork();
            this.network = new NetworkModel(.5, 30, [30], 1);
            
            this.nodes[this.dataNode.getNode()._id] = this.dataNode;

            var hiddenLayer = this.createLayer(this.network.hiddenLayers[0].numNodes, this.dataNode, 'hidden');
            var outputLayer = this.createLayer(trainingData.output[0].length, hiddenLayer, 'output');

            this.network.inputs = [outputLayer.getNode()._id];

            this.executeNetwork(this.network, outputLayer.getNode());

            /*outputLayer.nodes.forEach((output, index) => {
                this.network.inputs.push(output._id);
                var outputNode = this.loadNode(output);
                outputNode.layerIndex = index;
            });*/
        });
    }

    private createLayer(numNodes: number, inputLayer: BaseNode<Node>, name?: string) {
        var layer = new NetworkLayerNode(numNodes, name);
        layer.setInputs([inputLayer.getNode()]);
        this.nodes[layer.getNode()._id] = layer;
        return layer;
    }

    log(obj: {}) {
        console.log(JSON.stringify(obj));
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

        /*this.network.inputs.forEach(id => {
            this.print(this.nodes[id], 0);
        });*/
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

    updateNodeWeights() {
        ActivateNodeEvent.isSocketEvent = false;
        this.processes.forEach(process => process.clearProcessedEvents());

        if(Network.isLearning) {
            this.epochCount++;
            AppEventQueue.notify(new UpdateNodeWeightsEvent(this.network.learnRate));
            console.log('completed epoch', this.epochCount);
            console.log('epoch time:', ((Date.now() - this.prevStartTime) / 1000) + 's');
            console.log('epoch timings:', JSON.stringify(Network.timings));

            this.calculateCost();
            this.prevStartTime = Date.now();

            //run another epoch
            if(this.epochCount < this.network.epochs) {
                Network.timings = new NetworkTimings();
                AppEventQueue.notify(new InitializeDataEvent(null));
            }
            else {
                Network.isLearning = false;
                Network.timings = new NetworkTimings();
                AppEventQueue.notify(new ValidateDataEvent(null));
            }
        }
        else {
            console.log('validation complete');
            this.calculateCost();

            console.log('total time:', ((Date.now() - this.startTime) / 1000) + 's');
            console.log(JSON.stringify(Network.timings));

            this.evaluate();
        }
    }

    private calculateCost() {
        var totalCost = 0, trainingCount = 0;
        this.network.inputs.forEach(id => {
            totalCost += this.nodes[id].totalCost;
            trainingCount += this.nodes[id].trainingCount;
            this.nodes[id].totalCost = 0;
            this.nodes[id].trainingCount = 0;
        });

        trainingCount = trainingCount / this.network.inputs.length;
        console.log('total cost:', totalCost, 'avg. cost:', totalCost / trainingCount, 'training size:', trainingCount);
    }

    private evaluate() {
        if(this.network.inputs.length > 0) {
            var first = this.nodes[this.network.inputs[0]];
            var correct: number = 0, wrong: number = 0;
            
            for(var date in first.pastState) {
                var output = first.pastState[date].activation.output;

                for(var i = 0, len = first.pastState[date].activation.input.length; i < len; i++) {
                    var maxAct: number = 0, maxIndex: number, outputIndex = 0;
                    this.network.inputs.forEach(id => {
                        this.nodes[id].pastState[date].activation.input[i].forEach(act => {
                            if(act > maxAct) {
                                maxAct = act;
                                maxIndex = outputIndex;
                            }

                            outputIndex++;
                        });
                    });

                    if(output[i][maxIndex] == 1) {
                        correct++;
                    }
                    else {
                        wrong++;
                    }
                }
            }

            console.log(correct, wrong, correct + wrong);
            console.log(`Validation accuracy ${correct / (correct + wrong) * 100}%`);
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

export class NetworkTimings  {
    data: number = 0;
    event: number = 0;
    bevent: number = 0; 
    activation: number = 0;
    indicatorActivation: number = 0;
    backpropagation: number = 0;
    weight: number = 0;
    updateWeight: number = 0;
    resetError: number = 0;
    cost: number = 0;
}

process.on('uncaughtException', function (exception) {
  console.log(exception);
  throw(exception);
});