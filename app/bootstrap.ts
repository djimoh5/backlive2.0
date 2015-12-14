import {bootstrap, provide, ElementRef} from 'angular2/angular2';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, APP_BASE_HREF} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

/* services */
import * as Services from './config/imports/service';

var serviceBoostrap: any[] = [];

for(var key in Services) {
	serviceBoostrap.push(Services[key]);
}

import {AppComponent} from './component/app';
bootstrap(AppComponent, serviceBoostrap.concat([ROUTER_PROVIDERS, HTTP_PROVIDERS, ElementRef, provide(LocationStrategy, { useClass: HashLocationStrategy })]));