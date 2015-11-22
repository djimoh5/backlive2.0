//JQuery promise implementation...in app we are going to use native Promise, but let's keep this code around just in case we have browser issues
export class PromiseJQuery {
	deferred: Object;
	
	constructor() {
		this.deferred = $.Deferred();
	}
	
	then(success: Function, failure: Function = null): Promise {
		this.deferred.then(success, failure);
		return this;
	}
	
	resolve(data: any = null) {
		this.deferred.resolve(data);
	}
	
	static all (promises: Promise[]) {
		var defers: any[] = [];
		
		promises.forEach(promise => {
			if(promise && promise.deferred) {
				defers.push(promise.deferred);
			}
		});
		
		return $.when.apply($.when, defers);
	}
}