//import {WORKER_APP_PLATFORM, WORKER_APP_APPLICATION, WORKER_APP_ROUTER} from 'angular2/platform/worker_app';
import {bootstrap} from 'angular2/platform/browser';
import {platform, provide, ApplicationRef, ComponentRef, Injector, ElementRef} from "angular2/core";
import {PLATFORM_DIRECTIVES} from 'angular2/compiler';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ROUTER_PROVIDERS, APP_BASE_HREF, Router} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';


import * as Services from 'backlive/service';
var serviceBootstrap: any[] = [];

for(var key in Services) {
	serviceBootstrap.push(Services[key]);
}

var platformDirectives: any[] = [CORE_DIRECTIVES];

// UI
import * as UI from 'backlive/component/shared/ui';

for(var key in UI) {
	if(UI[key]) {
		platformDirectives.push(UI[key]);
	}
}
//console.log('dfdd')
import {AppComponent} from './component/app.component';
bootstrap(AppComponent, serviceBootstrap.concat([ROUTER_PROVIDERS, HTTP_PROVIDERS, ElementRef, provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true})]));

//platform([WORKER_APP_PLATFORM]).application([WORKER_APP_APPLICATION, WORKER_APP_ROUTER, provide(APP_BASE_HREF, { useValue: '/' })]).bootstrap(AppComponent, []);
/*platform(WORKER_APP_PLATFORM).asyncApplication(() => Promise.resolve([
    WORKER_APP_APPLICATION,
    WORKER_APP_ROUTER,
    provide(APP_BASE_HREF, { useValue: '/' }),
    provide(PLATFORM_DIRECTIVES, {useValue: platformDirectives, multi:true})
]))
.then((appRef: ApplicationRef) => {
    return appRef.bootstrap(AppComponent, serviceBootstrap.concat([HTTP_PROVIDERS, ElementRef]));
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