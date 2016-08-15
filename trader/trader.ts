/// <reference path="../typings/index.d.ts" />
var md5 = require('../js/md5.min.js');

import {BaseNode} from './base-node';
import {AppEventQueue} from './lib/events/app-event-queue';
import {Database} from './lib/data-access/database';

import {IDataHandler} from './data-handler/data-handler';
import {DataLoaderDataHandler} from './data-handler/dataloader-data-handler';

import {Strategy} from './strategy/strategy';
import {Strategy as StrategyModel} from '../app/service/model/strategy.model';

import {Portfolio} from './portfolio/portfolio';

import {IExecutionHandler} from './execution-handler/execution-handler';
import {BacktestExecutionHandler} from './execution-handler/backtest-execution-handler';

export class Trader {
    dataHandler: IDataHandler;
    portfolios: Portfolio[] = [];
    strategies: Strategy[] = [];
    executionHandler: IExecutionHandler;
    
    constructor(model: StrategyModel | any) {
        console.log(model);
        AppEventQueue.global();
        
        Database.open(() => {
            this.dataHandler = new DataLoaderDataHandler();
            /*this.strategies.push(new Strategy(model));
            this.portfolios.push(new Portfolio(model._id));
            this.executionHandler = new BacktestExecutionHandler();*/
            
            this.dataHandler.init();
        });
    }
}