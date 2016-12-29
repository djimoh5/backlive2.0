import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { NodeService } from './node.service';
import { Portfolio } from 'backlive/service/model';

@Injectable()
export class PortfolioService extends NodeService<Portfolio> {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'portfolio');
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
        return this.post('clear', null);
    }
}