import {platform, Provider} from 'angular2/core';
import {WORKER_RENDER_APP, WORKER_RENDER_PLATFORM, WORKER_SCRIPT, ServiceMessageBrokerFactory, PRIMITIVE} from 'angular2/platform/worker_render';

var appRef = platform([WORKER_RENDER_PLATFORM]).application([WORKER_RENDER_APP, new Provider(WORKER_SCRIPT, {useValue: "app/worker.ts"})]);
var broker = appRef.injector.get(ServiceMessageBrokerFactory).createMessageBroker("channel1");


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