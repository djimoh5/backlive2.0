/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

import { InitializeDataEvent, EpochCompleteEvent, UpdateNodeWeightsEvent } from './event/app.event';

import { NodeConfig } from './node/node.config';
import { Node } from '../core/service/model/node.model';
import { LoadNodeEvent, NodeChangeEvent } from '../app/component/node/node.event';

import { IDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';

import { IndicatorNode } from './node/indicator/indicator.node';

import { ExecuteNodeEvent } from '../app/component/node/node.event';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

export class Network {
    dataNode: IDataNode;
    nodes:  NodeMap<BaseNode<any>> = {};
    executionNode: IExecutionNode;

    activityState: number = 0;
    onIdle: () => void;

    subscriberName: string = 'network';
    
    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(NodeChangeEvent, this.subscriberName, event => this.loadNode(event.data));
        AppEventQueue.subscribe(LoadNodeEvent, this.subscriberName, event => this.loadOutputNode(event.data));
        AppEventQueue.subscribe(ExecuteNodeEvent, this.subscriberName, event => this.executeNetwork(event.data));
        AppEventQueue.subscribe(EpochCompleteEvent, this.subscriberName, event => this.updateNodeWeights());

        Database.open(() => {
            console.log('Database opened');
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new DataLoaderNode();
        });
    }

    loadOutputNode(node: Node) {
        var n: BaseNode<any> = this.loadNode(node);
    }

    loadNode(node: Node) {
        this.activity(true);
        if(!this.nodes[node._id]) {
            this.nodes[node._id] = new (NodeConfig.node(node.ntype))(this.cloneNode(node));
            this.nodes[node._id].onUpdateInputs = (inputNodes) => this.updateInputNodes(node, inputNodes);
        }
        else {
            this.nodes[node._id].setNode(this.cloneNode(node));
        }

        return this.nodes[node._id];
    }

    updateInputNodes(node: Node, inputNodes: { [key: string]: Node }) {
        for(var key in inputNodes) {
            var inputNode: BaseNode<any> = this.loadNode(inputNodes[key]);
            inputNode.updateOutput(this.cloneNode(node));
        }

        this.activity(false);
    }

    executeNetwork(node: Node) {
        this.onIdle = () => { AppEventQueue.notify(new InitializeDataEvent(null)); };
        this.loadOutputNode(node);
    }

    updateNodeWeights() {
        AppEventQueue.notify(new UpdateNodeWeightsEvent(.2)); //.2 learningRate
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