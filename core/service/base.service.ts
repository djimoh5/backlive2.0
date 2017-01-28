import { ISession, User } from '../lib/session';
import { Database } from '../lib/database';
import { BaseRepository } from '../repository/base.repository';

var Q = require('q');

export abstract class BaseService {
    protected get database(): any { return Database.mongo; };
    protected session: ISession;
    protected user: User;
    protected promise: Promise<any>;

    private deferred: { resolve: Function, promise: Promise<any> };

    constructor(session: ISession, repositories?: { [key: string]: { new(): BaseRepository; } }) {
        this.session = session;
        this.user = session.user;

        if(repositories) {
            for(var key in repositories) {
                this[key] = new repositories[key]();
            }
        }

        this.initPromise();
    }

    private initPromise() {
        this.deferred = Q.defer();
        this.promise = this.deferred.promise;
    }

	done(data: any) {
		this.deferred.resolve(data);
        this.initPromise();
	}
    
    success(data?: any) {
        var obj = { success: 1 };
        if(data) { obj['data'] = data; };
		this.deferred.resolve(obj);
        this.initPromise();
	}
    
    error(msg: string) {
        console.log(msg);
        this.deferred.resolve({ success: 0, msg: msg });
        this.initPromise();
    }

    dbObjectId(oid: string) {
        return new Database.ObjectID(oid);
    }
}