/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { VirtualNodeService } from './node/basic/virtual-node.service';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

import { InitializeDataEvent, EpochCompleteEvent, UpdateNodeWeightsEvent } from './event/app.event';

import { NodeConfig } from './node/node.config';
import { Node, NodeType } from '../core/service/model/node.model';
import { LoadNodeEvent, NodeChangeEvent } from '../app/component/node/node.event';

import { IDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';

import { ExecuteNodeEvent } from '../app/component/node/node.event';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

import { Common } from '../app//utility/common';

export class Network {
    dataNode: IDataNode;
    nodes:  NodeMap<BaseNode<any>> = {};
    outputNode: Node;
    executionNode: IExecutionNode;

    activityState: number = 0;
    onIdle: () => void;

    subscriberName: string = 'network';

    hyperParams: HyperParameters;
    
    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(NodeChangeEvent, this.subscriberName, event => this.loadNode(event.data));
        AppEventQueue.subscribe(LoadNodeEvent, this.subscriberName, event => this.loadOutputNode(event.data));
        AppEventQueue.subscribe(ExecuteNodeEvent, this.subscriberName, event => this.executeNetwork(event.data));
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights(event.data));

        Database.open(() => {
            console.log('Database opened');
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new DataLoaderNode();
        });
    }

    loadNode(node: Node, inputNodes?: { [key: string]: Node }) { //inputNodes only used for virtual nodes
        this.activity(true);
        var clone = this.cloneNode(node);

        if(!this.nodes[node._id]) {
            this.nodes[node._id] = new (NodeConfig.node(node.ntype))(clone);
            this.nodes[node._id].onUpdateInputs = (inputNodes) => this.updateInputNodes(clone, inputNodes);

            if(node.ntype === NodeType.Virtual) {
                VirtualNodeService.save(node, inputNodes);
            }
        }
        else {
            this.nodes[node._id].setNode(clone);
        }

        return this.nodes[node._id];
    }

    updateInputNodes(node: Node, inputNodes: { [key: string]: Node }) {
        if(node.ntype === NodeType.Strategy) {
            this.createVirtualNodes(node, inputNodes);
        }
        else {
            for(var key in inputNodes) {
                var inputNode: BaseNode<any> = this.loadNode(inputNodes[key]);
                inputNode.updateOutput(this.cloneNode(node));
            }
        }

        this.activity(false);
    }

    createVirtualNodes(node: Node, inputNodes: { [key: string]: Node }) {
        var baseNode = this.nodes[node._id];
        var inputs = node.inputs;
        node.inputs = [];

        var hiddenNodes: Node[] = [];
        for(var i = 0; i < this.hyperParams.hiddenNodes; i++) {
            var model = new Node(NodeType.Virtual);
            model._id = Common.uniqueId();
            model.name = 'hidden' + (i + 1);
            model.inputs = inputs;

            hiddenNodes.push(model);
            node.inputs.push(model._id);

            this.loadNode(model, baseNode.getInputNodes()).updateOutput(this.cloneNode(node));
        }

        baseNode.updateInputs(hiddenNodes);
    }

    loadOutputNode(node: Node) {
        this.hyperParams = new HyperParameters(.5, 300);
        VirtualNodeService.reset();

        this.outputNode = node;
        this.loadNode(node);
    }

    executeNetwork(node: Node) {
        this.onIdle = () => {
            this.print(this.nodes[node._id], 0);
            AppEventQueue.notify(new InitializeDataEvent(null)); 
        };

        this.loadOutputNode(node);
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

    updateNodeWeights(date: number) {
        if(this.hyperParams.epochCount++ < this.hyperParams.epochs) {
            AppEventQueue.notify(new UpdateNodeWeightsEvent(this.hyperParams.learningRate)); //.2 learningRate

            //validate on out of sample test data here!!

            console.log('completed epoch', this.hyperParams.epochCount);

            //run another epoch
            AppEventQueue.notify(new InitializeDataEvent(null));
        }
        else {
            this.print(this.nodes[this.outputNode._id], 0);
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

    private cloneNode(node: Node) {
        var clone = new Node(node.ntype);
        for(var key in node) {
            clone[key] = node[key];
        }

        return clone;
    }
}

interface NodeMap<T> {
    [key: string]: T;
}

class HyperParameters {
    learningRate: number;
    epochs: number;
    epochCount: number = 0;
    hiddenNodes: number = 3;

    constructor(learningRate, epochs) {
        this.learningRate = learningRate;
        this.epochs = epochs;
    }
}