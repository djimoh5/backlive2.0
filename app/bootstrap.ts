/// <reference path="../typings/browser.d.ts" />

//import {WORKER_APP_PLATFORM, WORKER_APP_APPLICATION, WORKER_APP_ROUTER} from '@angular/platform/worker_app';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {PLATFORM_DIRECTIVES, provide, enableProdMode, ExceptionHandler, ApplicationRef, ComponentRef, Injector} from "@angular/core";
import {CORE_DIRECTIVES, APP_BASE_HREF} from '@angular/common';
import {ROUTER_PROVIDERS, Router} from '@angular/router-deprecated';
import {HTTP_PROVIDERS} from '@angular/http';


import * as Services from 'backlive/service';
var serviceBootstrap: any[] = [];

for(var key in Services) {
    if(Services[key]) {
        serviceBootstrap.push(Services[key]);
    }
}

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
bootstrap(AppComponent, serviceBootstrap.concat([ROUTER_PROVIDERS, HTTP_PROVIDERS, provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true}), 
    provide(PlatformUI, {useClass: DomUI}), provide(ExceptionHandler, {useClass: AppExceptionHandler})]))
    .catch(err => console.error(err));

//platform([WORKER_APP_PLATFORM]).application([WORKER_APP_APPLICATION, WORKER_APP_ROUTER, provide(APP_BASE_HREF, { useValue: '/' })]).bootstrap(AppComponent, []);
/*platform(WORKER_APP_PLATFORM).asyncApplication(() => Promise.resolve([
    WORKER_APP_APPLICATION,
    WORKER_APP_ROUTER,
    provide(APP_BASE_HREF, { useValue: '/' }),
    provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true})
]))
.then((appRef: ApplicationRef) => {
    return appRef.bootstrap(AppComponent, serviceBootstrap.concat([HTTP_PROVIDERS]));
})
.then((compRef: ComponentRef) => {
    const injector: Injector = compRef.injector;
    const router:   Router   = injector.get(Router);

    return (<any> router)._currentNavigation;
})
.then(() => {
    setTimeout(() => {
        postMessage('APP_READY', undefined);
    });
});*/