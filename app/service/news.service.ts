import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {AppService} from './app.service';

@Injectable()
export class NewsService extends BaseService {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'news');
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