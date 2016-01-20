import {Injectable} from 'angular2/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';

@Injectable()
export class TickerService extends BaseService {
    constructor(apiService: ApiService) {
        super(apiService, 'ticker');
    }
    
    getPrices(tkr: string, years: number = 10){
        return this.get(tkr + '/prices', { years: years }, true);
    }
    
    getPrice(tkr: string, date?: number) {
        if(date) {
            return this.get(tkr + '/price', { date: date }, true);
        }
        else {
            return this.get(tkr + '/lastprice', null, true);
        }
    }
    
    getIndicators(tkr: string) {
        return this.get(tkr + '/indicators', null, true);
    }
    
    getNews(tkr: string) {
        return this.get(tkr + '/news', null, true);
    }
    
    getSecDocument(tkr: string, path: string) {
        return this.get(tkr + '/sec', { path: path }, true);
    }
}