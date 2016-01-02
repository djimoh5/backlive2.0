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
    
    getPricing(tkr: string){
        return this.get('pricing/' + tkr);
    }
    
    indicators(tkr: string) {
        return this.get('indciators/' + tkr);
    }
}