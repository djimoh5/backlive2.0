import {Injectable} from 'angular2/angular2';
import {BaseService} from './base-service';
import {ApiService} from './api-service';
import {User} from 'model/user';
@Injectable()
export class StrategyService extends BaseService {
    user: User;
    userPromise: Promise<any>;
    
    constructor(apiService: ApiService) {
        super(apiService, 'strategy');
    }

    getStrategies() {
        return this.get('');
    }
}