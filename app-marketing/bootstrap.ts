import {bootstrap} from 'angular2/platform/browser';
import {provide, ElementRef} from 'angular2/core';
import {PLATFORM_DIRECTIVES} from 'angular2/compiler';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

/* services */
import {AppService, RouterService, AuthRouterOutlet, UserService, ApiService} from 'backlive/service';
var serviceBoostrap: any[] = [];

/* common platform directives */
var platformDirectives: any[] = [CORE_DIRECTIVES];

// UI
import * as UI from 'backlive/component/shared/ui';

for(var key in UI) {
	if(UI[key]) {
		platformDirectives.push(UI[key]);
	}
}

import {AppComponent} from './component/app.component';
bootstrap(AppComponent, [AppService, RouterService, AuthRouterOutlet, UserService, ApiService, HTTP_PROVIDERS, ROUTER_PROVIDERS, ElementRef, provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true})]);