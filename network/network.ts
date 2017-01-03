/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

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
    
    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(NodeChangeEvent, 'network', event => this.loadNode(event.data));
        AppEventQueue.subscribe(LoadNodeEvent, 'network', event => this.loadOutputNode(event.data));
        AppEventQueue.subscribe(ExecuteNodeEvent, 'network', event => this.executeNetwork(event.data));

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
        this.onIdle = () =>  this.dataNode.init();
        this.loadOutputNode(node);
    }

    private activity(active: boolean) {
        if(active) { this.activityState++; }
        else { this.activityState--; }

        console.log('activity state:', this.activityState);
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