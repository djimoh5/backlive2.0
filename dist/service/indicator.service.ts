import {Injectable} from 'angular2/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';

@Injectable()
export class StrategyService extends BaseService {
    constructor(apiService: ApiService) {
        super(apiService, 'indicator');
    }

    getIndicators() {
        return this.get('', null, true);
    }
    
    saveIndicator() {
        return this.post('', {});
    }
    
    removeIndicator(indicatorId: string) {
        return this.delete('/' + indicatorId);
    }
}