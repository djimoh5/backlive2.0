import {DataLoaderDataHandler} from './data-handler/dataloader-data-handler';
import {Strategy} from './strategy/strategy';
import {Portfolio} from './portfolio/portfolio';
import {BacktestExecutionHandler} from './execution-handler/backtest-execution-handler';

export class Trader {
    portfolios: Portfolio[];
    strategies: Strategy[];
    
    constuctor(settings) {
        
    }
}