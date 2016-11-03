import { Session, User } from '../lib/session';
import { Database } from '../lib/database';

var Q = require('q');

export class BaseService {
    protected get database(): any { return Database.mongo };
    protected session: Session;
    protected user: User;
    protected promise: Promise<any>;

    private deferred: { resolve: Function, promise: Promise<any> };

    constructor(session: Session) {
        this.session = session;
        this.user = session.user
        this.deferred = Q.defer();
        this.promise = this.deferred.promise;
    }

	done(data: any) {
		this.deferred.resolve(data);
	}
    
    success(data: any) {
		this.deferred.resolve({ success: 1, data: data });
	}
    
    error(msg: string) {
        console.log(msg);
        this.deferred.resolve({ success: 0, msg: msg });
    }

    dbObjectId(oid: string) {
        return new Database.ObjectID(oid);
    }
}