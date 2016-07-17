import {ROUTER_DIRECTIVES, provideRouter} from '@angular/router';
import {RouterService} from 'backlive/service';
import {Route} from './routes';

import {AuthGuard} from './auth.guard';

export const APP_ROUTER_PROVIDERS = [ 
    provideRouter(RouterService.AppRoutes(Route, AuthGuard)),
    AuthGuard
]