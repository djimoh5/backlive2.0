import {Component} from '@angular/core';
import {ControlGroup, Control, Validators, FORM_DIRECTIVES} from '@angular/common';
import {Path} from 'backlive/marketing/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/marketing/routes';
import {AppEvent, User} from 'backlive/service/model';

@Component({
    selector: 'app-home',
    templateUrl: Path.ComponentView('home'),
    directives: [FORM_DIRECTIVES]
})
export class HomeComponent extends PageComponent {
    userService: UserService;
    loginForm: ControlGroup;
    registerForm: ControlGroup;
    errMessage: boolean;
    
    headerHeight: number;
    introTextMargin: number;
    screenshotHeight: number;
    screenshotMiddleHeight: number;
    screenshotOverlayLineHeight: number;
    
    loginVisible: boolean;
    registerVisible: boolean;
    
    constructor (appService:AppService, userService: UserService) {
        super(appService);
        
        this.userService = userService;
        
        this.loginForm = new ControlGroup({
            username: new Control("", Validators.required),
            password: new Control("", Validators.required)
        });
        
        this.registerForm = new ControlGroup({
            username: new Control("", Validators.required),
            email: new Control("", Validators.required),
            password: new Control("", Validators.required),
            terms: new Control(false, Validators.required)
        });
        
        if(window) {
            this.adjustHeaderHeight();
        
            $(window).resize(() => {
                this.adjustHeaderHeight();
            });
            
            $('.dropdown-menu .login-form').click(function(e) {
                e.stopPropagation();
            });
        }
    }
    
    login() {
        this.errMessage = false;
        this.userService.login(this.loginForm.value).then(user => this.loginComplete(user));
    }
    
    register() {
        this.errMessage = false;
        this.userService.register(this.registerForm.value).then(user => this.loginComplete(user));
    }
    
    loginComplete(user: User) {
        console.log(user);
        
        if(user && user.token) {
            window.location.reload();
        }
    }
    
    forgotPassword() {
        
    }
    
    fieldRequired() {
        
    }
    
    showHideLogin() {
        this.errMessage = false;
        this.loginVisible = !this.loginVisible;
        this.registerVisible = false;
        
        setTimeout(() => { $('.sign-in-menu input').first().focus(); });   
    }
    
    showHideRegister() {
        this.errMessage = false;
        this.registerVisible = !this.registerVisible;
        this.loginVisible = false;
        
        setTimeout(() => { $('.register-menu input').first().focus(); });  
    }
    
    adjustHeaderHeight() {
        var winHeight = $(window).height();
        this.headerHeight = winHeight;

        var minMargin = 60, ssHeight = 300, introHeight = 554, imgAdj: any;
        var marginTop = winHeight - (introHeight + 93);
        
        if(marginTop >= minMargin) {
            imgAdj = 0;
            
            if(marginTop > 200) //really large screen so just center
                marginTop = Math.max(minMargin, ((winHeight - introHeight) / 2) - 93);
        }
        else {
            imgAdj = minMargin - marginTop;
            marginTop = minMargin;
        }
        
        this.introTextMargin = marginTop;
        this.screenshotHeight = ssHeight - imgAdj;
        this.screenshotMiddleHeight = ssHeight + 70 - imgAdj;
        this.screenshotOverlayLineHeight = ssHeight + 70 - imgAdj;
    }
}