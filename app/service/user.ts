﻿import {Injectable} from 'angular2/angular2';
import {BaseService} from '../service/base';
import {ApiService} from '../service/api';
import {User} from '../model/user';
@Injectable()
export class UserService extends BaseService {
    user: User;
    userPromise: Promise<any>;
    
    constructor(apiService: ApiService) {
        super(apiService, 'user');
    }
    
    getUser(){
        this.userPromise = this.get('').then((user: User) => this.handleLoginResponse(user));
        return this.userPromise;
    }
    
    login(username: string, password: string) {
        return this.post('login', { username:username, password:password }).then(user => this.handleLoginResponse(user));
    }
    
    logout() {
        return this.get('logout').then((user: User) => this.handleLoginResponse(user));
    }
    
    register(info: Object) {
        return this.post('register', info).then(user => this.handleLoginResponse(user));
    }
    
    createApplicant(info: Object) {
        return this.post('applicant', info);
    }
    
    private handleLoginResponse(user: User) {
        if(user != null && user.token) {
            this.user = user;
            this.apiService.token = user.token;
        }
        else {
            this.user = null;
        }
        
        return user;
    }
}