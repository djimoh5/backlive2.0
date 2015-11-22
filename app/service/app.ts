import {Common} from '../utility/common';

export class AppService {
    Events: any;
    
    constructor() {
        this.Events = {};
    }

    subscribe(name: string, callback: Function) {
        if (!this.Events[name]) {
            this.Events[name] = [];
        }

        this.Events[name].push(callback);
    }

    notify(name: string, data: any = null) {
        if (this.Events[name]) {
            //Common.log('EVENT: ' + name + ' fired to ' + this.Events[name].length + ' subscribers with data', data);
            this.Events[name].forEach((callback: Function) => {
                callback(data);
            });
        }
        else {
            Common.log('EVENT: ' + name + ' has no subscribers');
        }
    }
    
    clearEvent(name: string) {
        if (this.Events[name]) {
            delete this.Events[name];
        }
    }
}