/// <reference path="../typings/index.d.ts" />

import { BaseNode } from './node/base-node';
import { AppEventQueue } from './event/app-event-queue';
import { Database } from './lib/data-access/database';

import { IDataHandler } from './node/data-handler/data-handler';
import { DataLoaderDataHandler } from './node/data-handler/dataloader-data-handler';

import { Strategy } from './node/strategy/strategy';
import { Strategy as StrategyModel } from '../app/service/model/strategy.model';

import { Portfolio } from './node/portfolio/portfolio';

import { IExecutionHandler } from './node/execution-handler/execution-handler';
import { BacktestExecutionHandler } from './node/execution-handler/backtest-execution-handler';

export class Network {
    dataHandler: IDataHandler;
    portfolios: Portfolio[] = [];
    strategies: Strategy[] = [];
    executionHandler: IExecutionHandler;
    
    constructor(model: StrategyModel | any) {
        AppEventQueue.global();
        
        Database.open(() => {
            console.log('Database opened');
            this.dataHandler = new DataLoaderDataHandler();
            this.strategies.push(new Strategy(model));
            this.portfolios.push(new Portfolio(model._id));
            this.executionHandler = new BacktestExecutionHandler();
            
            this.dataHandler.init();
        });
    }
}