/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from '../core/lib/database';

import { IDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';

import { IndicatorNode } from './node/indicator/indicator.node';
import { IndicatorChangeEvent } from '../app/component/indicator/indicator.event';

import { StrategyNode } from './node/strategy/strategy.node';
import { Strategy } from '../core/service/model/strategy.model';
import { StrategyChangeEvent, ExecuteStrategyEvent } from '../app/component/strategy/strategy.event';

import { PortfolioNode } from './node/portfolio/portfolio.node';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

export class Network {
    dataNode: IDataNode;
    portfolios:  NodeMap<PortfolioNode> = {};
    strategies: NodeMap<StrategyNode> = {};
    indicators: NodeMap<IndicatorNode> = {};
    executionNode: IExecutionNode;
    
    constructor() {
        AppEventQueue.global();
        AppEventQueue.subscribe(StrategyChangeEvent, 'network', event => this.updateStrategy(event));
        AppEventQueue.subscribe(ExecuteStrategyEvent, 'network', event => this.executeStrategy(event));
        AppEventQueue.subscribe(IndicatorChangeEvent, 'network', event => this.updateIndicator(event));

        Database.open(() => {
            console.log('Database opened');
            //this.portfolios.push(new PortfolioNode(model._id));
            this.executionNode = new BacktestExecutionNode();
            this.dataNode = new DataLoaderNode();
        });
    }

    updateStrategy(event: StrategyChangeEvent) {
        if(!this.strategies[event.data._id]) {
            this.strategies[event.data._id] = new StrategyNode(event.data);
        }
        else {
            this.strategies[event.data._id].setModel(event.data);
        }

        console.log(this.strategies);
    }

    executeStrategy(event: ExecuteStrategyEvent) {
        this.dataNode.init();
    }

    updateIndicator(event: IndicatorChangeEvent) {
        if(!this.indicators[event.data._id]) {
            this.indicators[event.data._id] = new IndicatorNode(event.data);
        }
        else {
            this.indicators[event.data._id].setModel(event.data);
        }

        console.log(this.indicators);
    }
}

interface NodeMap<T> {
    [key: string]: T;
}