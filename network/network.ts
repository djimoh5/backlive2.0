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

import { StrategyNode } from './node/strategy/strategy.node';
import { ExecuteStrategyEvent } from '../app/component/strategy/strategy.event';

import { PortfolioNode } from './node/portfolio/portfolio.node';

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
        AppEventQueue.subscribe(NodeChangeEvent, 'network', event => this.updateNode(event.data));
        AppEventQueue.subscribe(LoadNodeEvent, 'network', event => this.loadNode(event.data));
        AppEventQueue.subscribe(ExecuteStrategyEvent, 'network', event => this.executeStrategy(event.data));

        Database.open(() => {
            console.log('Database opened');
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new DataLoaderNode();
        });
    }

    updateNode(node: Node) {
        this.activity(true);
        if(!this.nodes[node._id]) {
            this.nodes[node._id] = new (NodeConfig.node(node.ntype))(node);
            this.nodes[node._id].onUpdateInputs = (nodes) => this.updateInputNodes(nodes);
        }
        else {
            this.nodes[node._id].setNode(node);
        }
    }

    updateInputNodes(nodes: { [key: string]: Node }) {
        for(var key in nodes) {
            this.updateNode(nodes[key]);
        }

        this.activity(false);
    }

    executeStrategy(node: Node) {
        this.updateNode(node);
        this.onIdle = () =>  this.dataNode.init();
    }

    loadNode(node: Node) {
        this.updateNode(node);
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
}

interface NodeMap<T> {
    [key: string]: T;
}