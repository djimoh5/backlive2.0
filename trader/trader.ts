import {DataHandler} from './data-handler/data-handler';
import {DataLoaderDataHandler} from './data-handler/dataloader-data-handler';

import {Strategy} from './strategy/strategy';
import {Strategy as StrategyModel} from 'backlive/service/model';

import {Portfolio} from './portfolio/portfolio';

import {ExecutionHandler} from './execution-handler/execution-handler';
import {BacktestExecutionHandler} from './execution-handler/backtest-execution-handler';

export class Trader {
    portfolios: Portfolio[] = [];
    strategies: Strategy[] = [];
    
    constuctor(model: StrategyModel) {
        var strategy = new Strategy(model);
        this.portfolios.push(new Portfolio(strategy));
        
        var executionHandler: ExecutionHandler = new BacktestExecutionHandler();
        var dataHandler: DataHandler = new DataLoaderDataHandler();
    }
}