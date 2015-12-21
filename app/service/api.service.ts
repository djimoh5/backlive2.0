import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {Common} from '../utility/common';

@Injectable()
export class ApiService {
	baseUrl: string = '/api/';
    http: Http;
    token: string;
    
    constructor(http: Http) {
        this.http = http;
    }
    
    get(endpoint: string, data: any = null): Promise<any> {
        Common.log('API GET: ', endpoint, data);
        
        if(data != null) {
            var qs = "";
            
            for(var key in data) {
                qs += '&'.concat(key, '=', data[key]);
            }
            
            endpoint += '?' + qs.substring(1);
        }
        
        return this.execute(this.http.get(this.baseUrl + endpoint,
        { 
            headers: this.getHeaders()
        }));
    }

    post(endpoint: string, data: any): Promise<any> {
        Common.log('API POST: ', endpoint, data);
        
        return this.execute(this.http.post(this.baseUrl + endpoint, JSON.stringify(data),
        {
            headers: this.getHeaders()
        }));
    }
    
    delete(endpoint: string): Promise<any> {
        Common.log('API DELETE: ', endpoint);
        
        return this.execute(this.http.delete(this.baseUrl + endpoint,
        {
            headers: this.getHeaders()
        }));
    }
    
    load(endpoint: string) {
        Common.log('API LOAD: ', endpoint);
        window.location.href = this.baseUrl + endpoint;
    }
    
    private getHeaders() {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        
        if(this.token) {
            headers.append('Authorization', 'Basic ' + this.token);
        }
        
        return headers;
    }
    
    private execute(observable: any) {
        return new Promise((resolve, reject) => this.processResults(resolve, reject, observable));
    }
    
    private processResults(resolve: Function, reject: Function, observable: Observable<any>) {
        observable.subscribe(
                        (results: any) => resolve(results.json()),
                        (err: any) => this.processError(err, reject)
                  );
    }
    
    private processError(err: any, reject: Function) {
        if(err) {
            Common.log(err);
            
            if(reject) {
                reject(err);
            }
        }
    }
}