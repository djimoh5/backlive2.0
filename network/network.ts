/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base.node';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from './lib/data-access/database';

import { IDataNode } from './node/data/data.node';
import { DataLoaderNode } from './node/data/dataloader.node';

import { StrategyNode } from './node/strategy/strategy.node';
import { Strategy as StrategyModel } from '../app/service/model/strategy.model';

import { PortfolioNode } from './node/portfolio/portfolio.node';

import { IExecutionNode } from './node/execution/execution.node';
import { BacktestExecutionNode } from './node/execution/backtest-execution.node';

export class Network {
    dataNode: IDataNode;
    portfolios: PortfolioNode[] = [];
    strategies: StrategyNode[] = [];
    executionNode: IExecutionNode;
    
    constructor(model: StrategyModel | any) {
        AppEventQueue.global();
        
        Database.open(() => {
            console.log('Database opened');
            this.dataNode = new DataLoaderNode();
            this.strategies.push(new StrategyNode(model));
            this.portfolios.push(new PortfolioNode(model._id));
            this.executionNode = new BacktestExecutionNode();
            
            this.dataNode.init();
        });
    }
}