import {Injectable} from 'angular2/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';

@Injectable()
export class StrategyService extends BaseService {
    constructor(apiService: ApiService) {
        super(apiService, 'portfolio');
    }

    getPortfolio() {
        return this.get('', null, true);
    }
    
    addTrade() {
        return this.post('trade', {});
    }
    
    batchSaveTrades() {
        return this.post('trades', {});
    }
    
    removeTrade(tradeId: string) {
        return this.delete('trade/' + tradeId);
    }
    
    clearPortfolio() {
        return this.get('clear');
    }
}