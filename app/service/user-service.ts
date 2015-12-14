import {Injectable} from 'angular2/angular2';
import {BaseService} from './base-service';
import {ApiService} from './api-service';
import {User} from './model/user';
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
            this.apiService.token = user.token;
        }
        else {
            this.user = null;
        }
        
        return user;
    }
}