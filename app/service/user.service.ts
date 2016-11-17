import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { User } from 'backlive/service/model';

@Injectable()
export class UserService extends BaseService {
    user: User;
    userPromise: Promise<any>;
    
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'user');
        this.appService.userService = this;
    }
    
    getUser(){
        this.userPromise = this.get('').then((user: User) => this.handleLoginResponse(user));
        return this.userPromise;
    }
    
    login(loginInfo: Object) {
        return this.post('login', loginInfo).then(user => this.handleLoginResponse(user));
    }
    
    logout() {
        return this.get('logout').then((user: User) => this.handleLoginResponse(user));
    }
    
    register(registerInfo: Object) {
        return this.post('register', registerInfo).then(user => this.handleLoginResponse(user));
    }
    
    createApplicant(info: Object) {
        return this.post('applicant', info);
    }
    
    private handleLoginResponse(user: User) {
        if(user != null && user.token) {
            this.user = user;
            this.apiService.setToken(user.token);
        }
        else {
            this.user = null;
        }
        
        return user;
    }
}