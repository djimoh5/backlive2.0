/// <reference path="../typings/browser.d.ts" />

import {bootstrap} from '@angular/platform-browser-dynamic';
import {PLATFORM_DIRECTIVES, provide, enableProdMode, ExceptionHandler} from '@angular/core';
import {CORE_DIRECTIVES, APP_BASE_HREF} from '@angular/common';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {HTTP_PROVIDERS} from '@angular/http';

/* services */
import {AppService, RouterService, AuthRouterOutlet, UserService, ApiService} from 'backlive/service';
var serviceBoostrap: any[] = [];

/* common platform directives */
import {AnimateDirective} from 'backlive/directive';
var platformDirectives: any[] = [CORE_DIRECTIVES, AnimateDirective];

// UI
import * as UI from 'backlive/component/shared/ui';

for(var key in UI) {
	if(UI[key]) {
		platformDirectives.push(UI[key]);
	}
}

import {PlatformUI, DomUI} from 'backlive/utility/ui';
import {AppExceptionHandler} from 'backlive/utility';

declare var WEB_CONFIG:any;
if(!WEB_CONFIG.Development) {
    enableProdMode();
}

import {AppComponent} from './component/app.component';
bootstrap(AppComponent, [AppService, RouterService, AuthRouterOutlet, UserService, ApiService, ROUTER_PROVIDERS, HTTP_PROVIDERS, provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true}), 
    provide(PlatformUI, {useClass: DomUI}), provide(ExceptionHandler, {useClass: AppExceptionHandler})])
    .catch(err => console.error(err));