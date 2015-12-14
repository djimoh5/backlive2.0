import {bootstrap, provide, ElementRef} from 'angular2/angular2';
import {ROUTER_PROVIDERS, APP_BASE_HREF} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

/* services */
import {AppService, RouterService, AuthRouterOutlet, ApiService, UserService} from '../config/imports/service';

import {AppComponent} from './component/app';
bootstrap(AppComponent, [AppService, UserService, ApiService, RouterService, AuthRouterOutlet, ROUTER_PROVIDERS, HTTP_PROVIDERS, ElementRef, provide(APP_BASE_HREF, {useValue: '/'})]);