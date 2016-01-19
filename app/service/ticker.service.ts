import {Injectable} from 'angular2/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {User} from './model/user';
@Injectable()
export class TickerService extends BaseService {
    user: User;
    userPromise: Promise<any>;
    
    constructor(apiService: ApiService) {
        super(apiService, 'ticker');
    }
    
    getPrices(tkr: string, years: number = 10){
        return this.get(tkr + '/prices', { years: years });
    }
    
    getPrice(tkr: string, date?: number) {
        if(date) {
            return this.get(tkr + '/price', { date: date });
        }
        else {
            return this.get(tkr + '/lastprice');
        }
    }
    
    getIndicators(tkr: string) {
        return this.get(tkr + '/indicators');
    }
}