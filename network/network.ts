/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { NetworkService } from '../core/service/network.service';
import { VirtualNodeService } from './node/basic/virtual-node.service';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

import { NodeProcessReadyEvent, TrainDataEvent, EpochCompleteEvent, UpdateNodeWeightsEvent, ValidateDataEvent, ActivateNodeEvent } from './event/app.event';

import { NodeConfig } from './node/node.config';
import { Node, NodeType } from '../core/service/model/node.model';
import { Network as NetworkModel } from '../core/service/model/network.model';
import { LoadNetworkEvent, ExecuteNetworkEvent } from '../app/component/network/network.event';

import { NetworkLayerNode } from './node/layer.node';

import { BaseDataNode } from './node/data/data.node';

import { IExecutionNode } from './node/execution/execution.node';

import { ICostFunction, CostFunctionType, CostFunctionFactory } from './lib/cost-function';
import { ProcessWrapper } from './process-wrapper';

export class Network {
    static network: NetworkModel;
    get network(): NetworkModel { return Network.network; };
    set network(network: NetworkModel) { Network.network = network; };

    nodes:  NodeMap<BaseNode<any>> = {};
    private networkService: NetworkService;

    outputLayer: NetworkLayerNode;

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

    constructor(private dataNode: BaseDataNode, private executionNode?: IExecutionNode) {
        //AppEventQueue.subscribe(LoadNetworkEvent, this.subscriberName, event => this.loadNetwork(event.data));
        AppEventQueue.subscribe(ExecuteNetworkEvent, this.subscriberName, event => this.executeNetwork(event.data));
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights());

        Database.open(() => {
            console.log('Database opened');
            if(this.onReady) {
                this.onReady();
            }
        });
    }

    onReady: () => void;

    loadNode(node: Node) {
        this.activity(true);

        if(!this.nodes[node._id]) {
            this.nodes[node._id] = new (NodeConfig.node(node.ntype))(node);
        }
        else {
            this.nodes[node._id].setNode(node);
        }

        this.nodes[node._id].onNodeLoaded = (inputNodes) => this.updateInputNodes(node, inputNodes);

        return this.nodes[node._id];
    }

    updateInputNodes(node: Node, inputNodes: Node[]) {
        if(inputNodes.length) {
            inputNodes.forEach((input, index) => {     
                var inputNode: BaseNode<any> = this.loadNode(input);
                inputNode.updateOutput(node);
                inputNode.layerIndex = index;
            });
        }
        else {
            if(node.ntype !== NodeType.Virtual) {
                var featureOutput = this.nodes[this.nodes[node._id].getOutputs()[0]];
                featureOutput.getNode().inputs = [this.outputLayer.getNode()._id];
            }
        }

        this.activity(false);
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
    }

    loadNetwork(network: NetworkModel, rootNode: Node = null) {
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
        this.resetNetwork();

        this.dataNode.load(trainingData => {
            this.nodes[this.dataNode.getNode()._id] = this.dataNode;
            var inputLayer: BaseNode<Node> = this.dataNode;

            network.hiddenLayers.forEach((numNodes, index) => {
                inputLayer = this.createLayer(numNodes, inputLayer, 'hidden' + index);
            }); 
            
            this.outputLayer = this.createLayer(this.dataNode.numClasses, inputLayer, 'output');

            this.loadNetwork(network, this.outputLayer.getNode());
            if(network.inputs) {
                this.loadNetwork(this.network);
            }
        });

        this.onIdle = () => {
            this.printNetwork();

            if(this.multiProcess) {
                this.initProcesses();
                this.prevStartTime = this.startTime;
            }
            else {
                this.startTime = Date.now();
                this.prevStartTime = this.startTime;
                AppEventQueue.notify(new TrainDataEvent(this.network.batchSize));
            }
        };
    }

    create(learningRate: number, numEpochs: number, batchSize: number, regParam: number, hiddenLayers: number[]) {
        this.network = new NetworkModel(learningRate, numEpochs, batchSize, regParam, hiddenLayers);
        this.executeNetwork(this.network);
    }

    private createLayer(numNodes: number, inputLayer: BaseNode<Node>, name?: string) {
        var layer = new NetworkLayerNode(numNodes, name);
        layer.setInputs([inputLayer.getNode()]);
        this.nodes[layer.getNode()._id] = layer;
        return layer;
    }

    updateNodeWeights() {
        ActivateNodeEvent.isSocketEvent = false;
        this.processes.forEach(process => process.clearProcessedEvents());

        if(Network.isLearning) {
            this.epochCount++;
            AppEventQueue.notify(new UpdateNodeWeightsEvent(null));
            console.log('completed epoch', this.epochCount);
            console.log('epoch time:', ((Date.now() - this.prevStartTime) / 1000) + 's');
            console.log('epoch timings:', JSON.stringify(Network.timings));

            this.calculateCost();
            this.prevStartTime = Date.now();

            //run another epoch
            if(this.epochCount < this.network.epochs) {
                Network.timings = new NetworkTimings();
                AppEventQueue.notify(new TrainDataEvent(this.network.batchSize));
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
        var totalCost = this.outputLayer.totalCost;
        var trainingCount = this.outputLayer.trainingCount;
        this.outputLayer.totalCost = 0;
        this.outputLayer.trainingCount = 0;

        console.log('total cost:', totalCost, 'cost:', totalCost / trainingCount, 'training size:', trainingCount);
    }

    private evaluate() {
        var correct: number = 0, wrong: number = 0;
        var pastState = this.outputLayer.pastState;
        
        for(var date in pastState) {
            var output = pastState[date].activation.output;
            var numColumns = pastState[date].activation.columns();

            for(var row = 0, len = pastState[date].activation.rows(); row < len; row++) {
                var maxAct: number = 0, maxIndex: number, outputIndex = 0;
                var activation = pastState[date].activation;

                for(var j = 0; j < numColumns; j++) {
                    var act = activation.get(row, j);
                    if(act > maxAct) {
                        maxAct = act;
                        maxIndex = outputIndex;
                    }

                    outputIndex++;
                }

                if(output[row*numColumns + maxIndex] == 1) {
                    correct++;
                }
                else {
                    wrong++;
                }
            }
        }

        console.log(correct, wrong, correct + wrong);
        console.log(`Validation accuracy ${correct / (correct + wrong) * 100}%`);

        if(!this.network.inputs) {
            process.exit(0);
        }
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

        var pendingProcesses = 0;
        var numProcesses = 0;

        AppEventQueue.unsubscribe(this.subscriberName, NodeProcessReadyEvent);
        AppEventQueue.subscribe(NodeProcessReadyEvent, this.subscriberName, event => {
            console.log('process for node', event.data, 'ready');
            if(--pendingProcesses === 0) {
                this.startTime = Date.now();
                AppEventQueue.notify(new TrainDataEvent(this.network.batchSize));
            }
        });

        for(var key in this.nodes) {
            if(this.nodes[key].numOutputs() > 0) {
                pendingProcesses++;
                this.nodes[key].useProcess(this.processes[numProcesses++ % this.maxProcesses]); 
            }
        }
    }

    printNetwork() {
        console.log(this.network);

        if(this.network.inputs) {
            this.network.inputs.forEach(id => {
                this.print(this.nodes[id], 0);
            });
        }
        else {
            console.log(this.outputLayer);
            this.print(this.outputLayer, 0);
        }
    }

    print<T extends Node>(baseNode: BaseNode<T>, level: number) {
        level++;
        var node = baseNode.getNode();
        console.log(level, " - ", node._id, baseNode.numNodes, node.weights);

        if(node.inputs) {
            node.inputs.forEach(nid => {
                this.print(this.nodes[nid], level);
            });
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

    log(obj: {}) {
        console.log(JSON.stringify(obj));
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