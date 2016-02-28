import {platform, provide} from 'angular2/core';
import {WebWorkerInstance, WORKER_RENDER_APP, WORKER_RENDER_PLATFORM, WORKER_SCRIPT, WORKER_RENDER_ROUTER, ServiceMessageBrokerFactory, PRIMITIVE} from 'angular2/platform/worker_render';

import {BrowserPlatformLocation} from "angular2/src/router/browser_platform_location";
import {MessageBasedPlatformLocation} from "angular2/src/web_workers/ui/platform_location";

let appRef = platform([WORKER_RENDER_PLATFORM]).application([WORKER_RENDER_APP, WORKER_RENDER_ROUTER, provide(WORKER_SCRIPT, {useValue: "app/worker.ts"})]);
let broker = appRef.injector.get(ServiceMessageBrokerFactory).createMessageBroker("channel1");
const worker = appRef.injector.get(WebWorkerInstance).worker;

worker.addEventListener('message', function onAppReady(event) {
  if (event.data === 'APP_READY') {
    worker.removeEventListener('message', onAppReady, false);
    //URL.revokeObjectURL(workerScriptUrl);
    console.log('bootstrap complete');
    setTimeout(() => document.dispatchEvent(new Event('BootstrapComplete')));
  }
}, false);

class PlatformUI {
    constructor() {
        broker.registerMethod("hide", [PRIMITIVE], (arg1: string) => this.hide(arg1), PRIMITIVE);
    }
    
    hide(selector: string) {
        console.log('hiding', selector);
        $(selector).fadeOut();
        return new Promise((resolve, reject) => { resolve("we did it!") });
    }
}

var platformUI = new PlatformUI();