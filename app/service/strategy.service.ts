import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {AppService} from './app.service';
import {User} from './model/user.model';

@Injectable()
export class StrategyService extends BaseService {
    user: User;
    userPromise: Promise<any>;
    
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'strategy');
    }

    getBacktests() {
        return this.get('', null, true);
    }
    
    saveBacktest(backtestId: string, name: string) {
        return this.post(backtestId, { name: name });
    }
    
    removeBacktest(backtestId: string) {
        return this.delete(backtestId);
    }
    
    shareBacktest(backtestId: string, username: string, isPublic: boolean = false) {
        return this.post(backtestId + '/share', { username: username, isPublic: isPublic });
    }
    
    getAutomatedStrategy(backtestId: string) {
        return this.get(backtestId + '/automate', null, true);
    }
    
    automateStrategy(backtestId: string, startCapital: number) {
        return this.post(backtestId + '/automate', { startCapital: startCapital });
    }
    
    stopAutomation(backtestId: string) {
        return this.delete(backtestId + '/automate');
    }
    
    markStrategyAsExecuted(backtestId: string, date: string) {
        return this.post(backtestId + '/executed', { date: date });
    }
}