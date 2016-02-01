import {Component, bind, ViewEncapsulation, ElementRef, Attribute} from 'angular2/core';
import {ClientMessageBrokerFactory, PRIMITIVE, UiArguments, FnArg} from 'angular2/platform/worker_app';

@Component({
    selector: 'backlive-app',
    templateUrl: 'app/component/app.component.html',
    directives:[]
})
export class AppComponent {
    constructor(brokerFactory: ClientMessageBrokerFactory) {
        var broker = brokerFactory.createMessageBroker("channel1");

        var args = [new FnArg('#test', PRIMITIVE)];
        var methodInfo = new UiArguments("hide", args);
        broker.runOnService(methodInfo, PRIMITIVE).then((result: string) => {
            console.log(result)
        });
    }
}