import {Base} from './base';
import {AppEventQueue} from './lib/events/app-event-queue';
import {Database} from './lib/data-access/database';

import {IDataHandler} from './data-handler/data-handler';
import {DataLoaderDataHandler} from './data-handler/dataloader-data-handler';

import {Strategy} from './strategy/strategy';
import {Strategy as StrategyModel} from 'backlive/service/model';

import {Portfolio} from './portfolio/portfolio';

import {IExecutionHandler} from './execution-handler/execution-handler';
import {BacktestExecutionHandler} from './execution-handler/backtest-execution-handler';

export class Trader extends Base {
    dataHandler: IDataHandler;
    portfolios: Portfolio[] = [];
    strategies: Strategy[] = [];
    executionHandler: IExecutionHandler;
    
    constuctor(model: StrategyModel) {
        AppEventQueue.global();
        
        Database.open(() => {
            this.dataHandler = new DataLoaderDataHandler();
            this.strategies.push(new Strategy(model));
            this.portfolios.push(new Portfolio(this.strategies[0].id));
            this.executionHandler = new BacktestExecutionHandler();
            
            this.dataHandler.init();
        });
    }
}