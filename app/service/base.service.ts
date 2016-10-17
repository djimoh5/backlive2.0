import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {ApiService} from './api.service';
import {AppService} from './app.service';
import {Config} from 'backlive/config';
import {Cache, Common} from 'backlive/utility';
import {AppEvent} from './model/app-event.model';

@Injectable()
export class BaseService {
    protected apiService: ApiService;
    protected appService: AppService;
    protected baseUrl: string;
    protected get ServiceComponentId() { return 'service' };
    
    get AuthorizationHeader(): { [key: string] : string }  { return this.apiService.AuthorizationHeader };
    
    constructor(apiService: ApiService, appService: AppService, baseUrl: string) {
        this.apiService = apiService;
        this.appService = appService;
        this.baseUrl = baseUrl;
    }
    
    protected get(endpoint: string, query: {} = null, useCache: boolean = false, cacheOptions: CacheOptions = {}) {
        var cacheKey: string, dataCacheKey: string;
        
        cacheOptions.query = cacheOptions.query ? cacheOptions.query : query;
        cacheOptions.expiration = cacheOptions.expiration ? cacheOptions.expiration : Config.CACHE_EXPIRATION;
        
        if(useCache) {
            cacheKey = this.getCacheKey(endpoint);
            
            if(query != null) {
                dataCacheKey = JSON.stringify(query);
            }
            
            var cacheData = Cache.get(cacheKey, this.apiService.ApiCacheCategory, dataCacheKey);
            
            if(cacheData) {
                //Common.log('CACHE GET: ', cacheKey, cacheData);
                return new Promise(resolve => {
                    resolve(cacheData);
                });
            }
        }
        
        var promise = this.createPromise(this.apiService.get(this.endpoint(endpoint), query));
        
        if(useCache) {
            promise.then((result: any) => this.cacheResults(cacheKey, result, cacheOptions.expiration, dataCacheKey));
        }
        
        return promise;
    }

    protected post(endpoint: string, data: Object, suppressPageLoadingEvent: boolean=false) {
        if (!suppressPageLoadingEvent) {
            this.appService.notify(AppEvent.PageLoading, true);
        }
        
        return this.createPromise(this.apiService.post(this.endpoint(endpoint), data), !suppressPageLoadingEvent);
    }
    
    protected put(endpoint: string, id: string, data: Object, suppressPageLoadingEvent: boolean=false) {
        if (!suppressPageLoadingEvent) {
            this.appService.notify(AppEvent.PageLoading, true);
        }
        
        return this.createPromise(this.apiService.put(this.endpoint(endpoint), id, data), !suppressPageLoadingEvent);
    }
    
    protected delete(endpoint: string) {
        this.appService.notify(AppEvent.PageLoading, true);
        return this.createPromise(this.apiService.delete(this.endpoint(endpoint)), true);
    }
    
    protected load(endpoint: string, query: {} = null) {
        this.apiService.load(this.endpoint(endpoint), query);
    }
    
    private createPromise(observable: Observable<Response>, loadingShown: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => this.processResults(resolve, observable, loadingShown));
    }
    
    private processResults(resolve: Function, observable: Observable<Response>, loadingShown: boolean = false) {
        var subscription: Subscription = observable.subscribe(
            (results: Response) => this.completeRequest(observable, () => {
                subscription.unsubscribe();
                resolve(results.json());
            }, loadingShown),
            (err: any) => this.completeRequest(observable, () => this.processError(err), loadingShown)
        );
    }
    
    private completeRequest (observable: Observable<Response>, requestOp: Function, loadingShown: boolean = false) {
        observable['request'].complete();
        
        if (loadingShown) {
            this.appService.notify(AppEvent.PageLoading, false);
        }
        
        requestOp();
    }
        
    private processError(err: Response) {
        if(err) {
            Common.log(err);
            var res = err.json();
            
            if((this.apiService.getToken() && res.message && res.message.indexOf('Authorization has been denied') >= 0) || Common.isDefined(res.isTrusted)) {
                this.apiService.setToken(null);
                this.appService.notify(AppEvent.ReloadApp);
            }
            else {
                if (Config.SHOW_ERRORS) {
                    this.appService.notify(AppEvent.OpenModal, { title: "API Request Error", body: JSON.stringify(res) });
                }
                else {
                    this.appService.notify(AppEvent.MessageBar, 'an unexpected error occurred');
                }
            }
        }
    }
    
    protected endpoint(path: string) {
        return path.length > 0 ? this.baseUrl + '/' + path : this.baseUrl;
    }
    
    protected cacheResults(cacheKey: string, result: any, cacheExpiration: number, subKey: string) {
        Cache.set(cacheKey, result, cacheExpiration, this.apiService.ApiCacheCategory, subKey);
    }
    
    protected removeCache(endpoint: string) {
        var cacheKey = this.getCacheKey(endpoint);
        Cache.remove(cacheKey, this.apiService.ApiCacheCategory);
        //Common.log('CACHE Flushed: ', cacheKey, data);
    }
    private getCacheKey(endpoint: string) {
        var cacheKey = this.endpoint(endpoint);
        var apiToken = this.apiService.getToken();
        
        if(apiToken) {
            cacheKey += apiToken;
        }
        
        return cacheKey;
    }
}
export interface CacheOptions {
    expiration?: number;
    query?: {};
}