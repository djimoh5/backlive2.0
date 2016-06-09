import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {AppService} from './app.service';

@Injectable()
export class StrategyService extends BaseService {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'indicator');
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