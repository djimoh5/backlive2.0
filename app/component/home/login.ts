import {Component, FORM_DIRECTIVES, ControlGroup, Control, CORE_DIRECTIVES} from 'angular2/angular2';
import {PageComponent} from '../shared/page';
import {AlertComponent} from '../shared/alert';
import {AppService} from '../../service/app';
import {UserService} from '../../service/user';
import {Route} from '../../service/router';

import {Event} from '../../model/event';
import {User} from '../../model/user';

@Component({
    selector: 'app-login',
    templateUrl: '/view/home/login.html',
    styleUrls: ['../../css/login.less'],
    directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, AlertComponent]
})
export class LoginComponent extends PageComponent {
    ENV: string = 'finance';
    userService: UserService;
    loginForm: ControlGroup;
    errMessage: string;
    
    constructor(appService: AppService, userService:UserService) {
        super(appService);
        
        this.userService = userService;
        
        this.loginForm = new ControlGroup({
            username: new Control("ban.ki.moon@un.org", this.fieldRequired),
            password: new Control("password", this.fieldRequired)
        });
    }
    
    fieldRequired(validator: string) {
        console.log(validator);
        return false;
    }
    
    loginUser() {
        this.errMessage = null;
        this.userService.login(this.loginForm.value.username, this.loginForm.value.password).then(user => this.loginComplete(user));
    }
    
    loginComplete(user: User) {
        if(user && user.token) {
            this.appService.notify(Event.Navigate, Route.Dashboard);
        }
        else {
            this.errMessage = user ? user.errorMessage : "an unexpected error occurred";
        }
    }
}