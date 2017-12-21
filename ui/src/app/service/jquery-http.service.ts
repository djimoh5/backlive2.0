import {Observable} from 'rxjs/Observable';
import {Headers, RequestMethod} from '@angular/http';

declare var $: any;

export class JQueryHttp {
	get(url: string, options?: RequestOptions) : Observable<Response> {
		return this.request(url, 'GET', null, options);
	}
	
	post(url: string, data: any, options?: RequestOptions) : Observable<Response> {
		return this.request(url, 'POST', data, options);
	}
	
	delete(url: string, options?: RequestOptions) : Observable<Response> {
		return this.request(url, 'DELETE', null, options);
	}
	
	private request(url: string, method: string, data?: any, options?: RequestOptions) : Observable<Response> {
		var params: any = {
			url: url,
			method: method
		};
		
		if(data) {
			params.data = data;
		}
		
		if(options && options.headers) {
			var headerObj = {};
			
			options.headers.keys().forEach(key => {
				headerObj[key] = options.headers.get(key);
			});
			
			params.headers = headerObj;
		}
		
		return Observable.create(observer => {
			$.ajax(params).done(function(res) {
				observer.next(new Response(res));
			})
			.fail(function(err) {
				observer.error(new Response(err));
			})
			.always(function() {
				observer.complete();
			});
		});
	}
}

export interface RequestOptions {
	headers?: Headers;
    method?: string | RequestMethod;
}

export class Response {
	body: string;
	
	constructor(body: string) {
		this.body = body;
	}
	
	json() {
		return this.body;
	}
}