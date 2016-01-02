import {Injectable} from 'angular2/core';
import {Http, Headers, Response, RequestOptionsArgs} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {Cache, Common} from 'backlive/utility';

@Injectable()
export class ApiService {
    private TOKEN_CACHE_KEY: string = 'API_TOKEN';
    
	private baseUrl: string = '/api/';
    private http: Http;
    private token: string;

    constructor(http: Http) {
        this.http = http;
    }
    
    setToken(token: string) {
        this.token = token;
        
        if(token == null) {
            Cache.remove(this.TOKEN_CACHE_KEY);
        }
        else {
            Cache.set(this.TOKEN_CACHE_KEY, this.token, 86400 * 30); //30 day token
        }
    }
    
    getToken() {
        return this.token;
    }
    
    get(endpoint: string, data: any = null): Promise<any> { 
        if(data != null) {
            var qs = "";
            
            for(var key in data) {
                qs += '&'.concat(key, '=', data[key]);
            }
            
            endpoint += '?' + qs.substring(1);
        }
        
        return this.execute(new ApiRequest(this.http, ApiRequestMethod.GET, this.baseUrl + endpoint,
        { 
            headers: this.getHeaders()
        }));
    }

    post(endpoint: string, data: any): Promise<any> {
        return this.execute(new ApiRequest(this.http, ApiRequestMethod.POST, this.baseUrl + endpoint,
        {
            headers: this.getHeaders()
        }, JSON.stringify(data)));
    }
    
    delete(endpoint: string): Promise<any> {
        return this.execute(new ApiRequest(this.http, ApiRequestMethod.DELETE, this.baseUrl + endpoint,
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
        
        if(!this.token) {
            this.token = Cache.get(this.TOKEN_CACHE_KEY);
        }
        
        if(this.token) {
            headers.append('Authorization', 'Basic ' + this.token);
        }
        
        return headers;
    }
    
    private execute(request: ApiRequest) {
        var observable: Observable<Response> = request.execute();
        return new Promise((resolve, reject) => this.processResults(resolve, reject, observable, request));
    }
    
    private processResults(resolve: Function, reject: Function, observable: Observable<Response>, request: ApiRequest) {
        observable.subscribe(
            (results: any) => this.processSuccess(results, resolve, request),
            (err: any) => this.processError(err, reject, request)
        );
    }
    
    private processSuccess(results: any, resolve: Function, request: ApiRequest) {
        resolve(results.json());
        request.complete();
    }
        
    private processError(err: any, reject: Function, request: ApiRequest) {
        if(err) {
            Common.log(err);
            
            if(reject) {
                reject(err);
            }
        }
        
        request.complete();
    }
}

class ApiRequest {
    service: Http;
    method: string;
    url: string;
    data: string;
    options: RequestOptionsArgs;
    
    startTime: number;
    
    constructor(service: Http, method: string, url: string, options: RequestOptionsArgs, data?: string) {
        this.service = service;
        this.method = method;
        this.url = url;
        this.data = data;
        this.options = options;
    }
    
    execute() : Observable<Response> {
        this.startTime = new Date().getTime();
        
        if(this.data) {
            return this.service[this.method](this.url, this.data, this.options);
        }
        else {
            return this.service[this.method](this.url, this.options);
        }
    }
    
    complete() {
        var duration = new Date().getTime() - this.startTime;
        Common.log('API ' + this.method, this.url, this.data ? this.data : '', '- duration', duration, 'ms');
    }
}

class ApiRequestMethod {
    static GET = 'get';
    static POST = 'post';
    static DELETE = 'delete';
    static PUT = 'put';
}