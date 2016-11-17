/// <reference path="../typings/index.d.ts" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './component/app.module';

declare var WEB_CONFIG:any;
if(!WEB_CONFIG.Development) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));


