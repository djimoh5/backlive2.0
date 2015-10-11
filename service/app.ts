export class AppService {
    Events: any;
    
    constructor() {
        this.Events = {};
    }
    
    subscribe(name: string, callback: Function) {
        if(!this.Events[name]) {
            this.Events[name] = [];
        }
        
        this.Events[name].push(callback);
    }
    
    notify(name: string, data: any = null) {
        if(this.Events[name]) {
            this.Events[name].forEach(callback => {
                callback(data);
            });
        }
    }
}