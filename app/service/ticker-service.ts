import {Injectable} from 'angular2/angular2';
import {BaseService} from '../service/base';
import {ApiService} from '../service/api';
import {User} from '../model/user';
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