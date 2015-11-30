import {Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';

@Component({
    selector: 'app-home',
    templateUrl: '/view/marketing/home.html',
    directives: [CORE_DIRECTIVES]
})
export class HomeComponent extends BaseComponent {
    headerHeight: number;
    introTextMargin: number;
    screenshotHeight: number;
    screenshotMiddleHeight: number;
    screenshotOverlayLineHeight: number;
    
    loginVisible: boolean;
    registerVisible: boolean;
    
    constructor (appService:AppService) {
        super(appService);
        
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
        
    }
    
    register() {
        
    }
    
    forgotPassword() {
        
    }
    
    showHideLogin() {
        this.loginVisible = !this.loginVisible;
        this.registerVisible = false;
        
        setTimeout(() => { $('#txt_uname').focus(); });   
    }
    
    showHideRegister() {
        this.registerVisible = !this.registerVisible;
        this.loginVisible = false;
        
        setTimeout(() => { $('#txt_reg_uname').focus(); });  
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