import {Injectable} from 'angular2/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';

@Injectable()
export class StrategyService extends BaseService {
    constructor(apiService: ApiService) {
        super(apiService, 'news');
    }

    getCustomFeed(rss: string) {
        return this.get('custom', { rss: rss }, true);
    }
    
    getMarketNews() {
        return this.get('market', null, true);
    }
    
    getCNBC() {
        return this.get('cnbc', null, true);
    }
    
    getBloombergRadio() {
        return this.get('bloombergradio', null, true);
    }
    
    getEconomist() {
        return this.get('economist', null, true);
    }
}