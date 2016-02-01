//import {WORKER_APP_PLATFORM, WORKER_APP_APPLICATION} from 'angular2/platform/worker_app';
import {bootstrap} from 'angular2/platform/browser';
import {platform, provide, ElementRef} from "angular2/core";
import {PLATFORM_DIRECTIVES} from 'angular2/compiler';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';


import * as Services from 'backlive/service';
var serviceBoostrap: any[] = [];

for(var key in Services) {
	serviceBoostrap.push(Services[key]);
}


var platformDirectives: any[] = [CORE_DIRECTIVES];

// UI
import * as UI from 'backlive/component/shared/ui';

for(var key in UI) {
	if(UI[key]) {
		platformDirectives.push(UI[key]);
	}
}

import {AppComponent} from './component/app.component';
//platform([WORKER_APP_PLATFORM]).application([WORKER_APP_APPLICATION]).bootstrap(AppComponent, serviceBoostrap.concat([ROUTER_PROVIDERS]));
bootstrap(AppComponent, serviceBoostrap.concat([ROUTER_PROVIDERS, HTTP_PROVIDERS, ElementRef, provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true})]));
