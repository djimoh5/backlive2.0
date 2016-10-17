import { NgModule, ErrorHandler }       from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';

import { AppComponent }   from './app.component';
import { SharedModule } from 'backlive/module/shared';
import { NavigationModule } from './navigation/navigation.module';

import {AccessDeniedComponent} from './home/access-denied/access-denied.component';
import {HomeComponent} from './home/home.component';

/* routes */
import { Config, AuthGuard } from 'backlive/config';
import { routing } from './app.routing';

/* services */
import { ServiceModule } from '../service/service.module';

/* utilities */
import { PlatformUI, DomUI } from 'backlive/utility/ui';
import { AppExceptionHandler } from 'backlive/utility';

@NgModule({
    declarations: [
        AppComponent,
        AccessDeniedComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule, HttpModule, SharedModule, NavigationModule, ServiceModule, routing
    ],
    providers: [
        Title, AuthGuard,
        { provide: APP_BASE_HREF, useValue: Config.SITE_URL },
        { provide: PlatformUI, useClass: DomUI }, 
        { provide: ErrorHandler, useClass: AppExceptionHandler }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}