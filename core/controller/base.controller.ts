var url = require('url');

import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ISession, Session } from '../lib/session';
import { BaseService } from '../service/base.service';

export function Get(path) {
    return function (target: BaseController, propertyKey: string, descriptor: PropertyDescriptor) {
		if(!target.get) { target.get = {}; };
		target.get[path] = target[propertyKey];
    };
}

export function Post(path) {
    return function (target: BaseController, propertyKey: string, descriptor: PropertyDescriptor) {
		if(!target.post) { target.post = {}; };
		target.post[path] = target[propertyKey];
    };
}

export function Delete(path) {
    return function (target: BaseController, propertyKey: string, descriptor: PropertyDescriptor) {
		if(!target.delete) { target.delete = {}; };
		target.delete[path] = target[propertyKey];
    };
}

export class BaseController {
    private services: { [key: string]: { new(session: ISession): BaseService; } };
    private router: express.Router = express.Router();
    get: { [key:string]: any };
    post: { [key:string]: any };
    delete: { [key:string]: any };

    static intialized: boolean;

    constructor(services?: { [key: string]: { new(session: ISession): BaseService; } }) {
        this.services = services;
        this.router = express.Router();

        this.router.use(bodyParser.json());
        this.router.use(bodyParser.urlencoded());
        this.router.use((req, res, next) => { this.queryParser(req, res, next); });
        this.router.use((req, res, next) => { this.initSession(req, res, next); });
        this.router.use((req, res, next) => { this.injectServices(req, res, next); });
    }

    private queryParser(req, res, next) {
        req.query = url.parse(req.url, true).query;
        next();
    }
    
	private initSession(req, res, next) {
		req.session = new Session(req, res);
		next();
	}
	
	private injectServices(req, res, next) {
		if(this.services) {
			res.services = {};
			for(var serviceIdentifier in this.services) {
				res.services[serviceIdentifier] = new this.services[serviceIdentifier](req.session);
			}
		}
		
        this.logRequest(req);
		next();
	}
    
    private logRequest(req) {
        if(req.originalUrl.indexOf('/api/') >= 0) {
            console.log(req.originalUrl);
            if(this.hasKeys(req.query)) {
                console.log('Query', req.query);
            }
            if(this.hasKeys(req.body)) {
                console.log('Body', req.body);
            }
            console.log('-------------------------------------');
        }
    }
    
    private hasKeys(obj) {
        for(var key in obj) {
            //if(obj && obj.hasOwnProperty(key)) {
                //return true;
            //}
        }
    }

	getRouter() {
        var self = this;
        
		for(var key in self) {
			if(key == 'post' && self.post) {
                for(var k in self.post) {
                    this.router.post(self.getRoutePath(k), self.post[k]);
                    console.log('- registering post route', k);
                }
            }
            else if(key == 'delete' && self.delete) {
                for(k in self.delete) {
                    this.router.delete(self.getRoutePath(k), self.delete[k]);
                    console.log('- registering delete route', k);
                }
            }
            else if(key == 'get' && self.get) {
                for(k in self.get) {
                    this.router.get(self.getRoutePath(k), self.get[k]);
                    console.log('- registering get route', k);
                }
            }
		}

		return this.router;
	}
    
    private getRoutePath(key) {
        return '/' + (key == 'index' ? '' : key.toLowerCase());
    }
}