import {Common} from 'backlive/utility';

export class PopupAlert {
    message: string;
    buttons: string[];
}

export class AppService {
    Events: { [key: string]: { [key: string]: Function[] } };

    constructor() {
        this.Events = {};
    }

    subscribe(eventName: string, classInstance: any, callback: Function) {
        var classType = classInstance.constructor.name;
        
        if(classType) {
            if (!this.Events[eventName]) {
                this.Events[eventName] = {};
            }
            
            if(!this.Events[eventName][classType]) {
                this.Events[eventName][classType] = [];
            }
    
            this.Events[eventName][classType].push(callback);
        }
        else {
            Common.log('Constructor Name not supported: ' + eventName + ' could not be subscribed to');
        }
    }
    
    unsubscribe(classInstance: any, eventName?: string) {
        var classType = classInstance.constructor.name;

        if(eventName && this.Events[eventName] && this.Events[eventName][classType]) {
            delete this.Events[eventName][classType];
        }
        else {
            for(var name in this.Events) {
                if(this.Events[name][classType]) {
                    delete this.Events[name][classType];
                }
            }
        }
    }

    notify<T>(eventName: string, data: T = null) {
        if (this.Events[eventName]) {
            //Common.log('EVENT: ' + eventName + ' fired to ' + this.Events[eventName].length + ' subscribers with data', data);
            for(var classType in this.Events[eventName]) {
                this.Events[eventName][classType].forEach((callback: Function) => {
                    callback(data);
                });
            }
        }
        else {
            Common.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }
    
    clearEvent(eventName: string) {
        if (this.Events[eventName]) {
            delete this.Events[eventName];
        }
    }
}