import {ApiService} from './api.service';
import {Cache} from '../utility/cache';
import {Common} from '../utility/common';

export class BaseService {
    protected apiService: ApiService;
	protected baseUrl: string;
    private defaultCacheExpiration: number = 10;//600; //in seconds, 10 minutes
	
    constructor(apiService: ApiService, baseUrl: string) {
        this.apiService = apiService;
		this.baseUrl = baseUrl;
    }
    
    protected get(endpoint: string, data: Object = null, useCache: boolean = false, cacheExpiration: number = this.defaultCacheExpiration) {
        var cacheKey: string;
        
        if(useCache) {
            cacheKey = this.getCacheKey(endpoint, data);
            var cacheData = Cache.get(cacheKey);
            
            if(cacheData) {
                Common.log('CACHE GET: ', cacheKey, data);
                return new Promise(resolve => {
                    resolve(cacheData);
                });
            }
        }

        var promise = this.apiService.get(this.endpoint(endpoint), data);
        
        if(useCache) {
            promise.then((result: any) => this.cacheResults(cacheKey, result, cacheExpiration));
        }
        
        return promise;
    }
    
    protected post(endpoint: string, data: Object) {
        return this.apiService.post(this.endpoint(endpoint), data);
    }
    
    protected delete(endpoint: string) {
        return this.apiService.delete(this.endpoint(endpoint));
    }
    
    protected load(endpoint: string) {
        return this.apiService.load(this.endpoint(endpoint));
    }

    protected endpoint(path: string) {
        return this.baseUrl + '/' + path;
    }
    
    protected cacheResults(cacheKey: string, result: any, cacheExpiration: number) {
        Cache.set(cacheKey, result, cacheExpiration);
    }
    
    protected removeCache(endpoint: string, data: Object = null) {
        var cacheKey = this.getCacheKey(endpoint, data);
        Cache.remove(cacheKey);
        Common.log('CACHE Flushed: ', cacheKey, data);
    }
    
    private getCacheKey(endpoint: string, data: Object = null) {
        endpoint = this.endpoint(endpoint);
        return data ? (endpoint + JSON.stringify(data)) : endpoint;
    }
}