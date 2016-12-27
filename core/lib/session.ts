var Cookies = require('cookies');
import { Config } from '../config';
import { Database as db } from './database';
import { Common } from '../../app/utility/common';
import { User } from '../service/model/user.model';
export { User } from '../service/model/user.model';

export class Session implements ISession {
    static pwSalt: string = 'bL1$3';
    static sessionIdName: string = 'bti_se$$_id';

    user: User;
    sessionId: string;
    cookies: any;

    static users: { [key: string]: User } = {};

    constructor(request, response) {
        this.cookies = new Cookies(request, response);
        this.sessionId = this.cookies.get(Session.sessionIdName);
        
        if(this.sessionId) {
            this.user = Session.users[this.sessionId];
        }

        if(!this.user) {
            this.user = { error:'no session id', uid: null };
        }
        else if(!this.user.username) {
            var oid = new db.ObjectID(this.user.uid);
            
            db.mongo.collection('user', (error, collection) => {
                collection.findOne({ _id:oid }, (err, result) => {
                    this.user.username = result.u;
                    this.user.email = result.e;
                    this.user.btuid = result.btuid;
                    this.user.btpid = result.btpid;
                    this.user.created = result.created;
                });
            });
        }
    }

    static load() {
        //load user sessions from DB
        db.mongo.collection('session', (error, collection) => {
            collection.find({}).toArray((err, results) => {
                for(var i = 0, cnt = results.length; i < cnt; i++) {
                    Session.users[results[i].sessId] = { uid: results[i].uid, token: results[i].token, sessId: results[i].sessId };
                }
            });
        });
    }
}

export interface IUser {
    uid: string;
}

export interface ISession {
    user: IUser;
    cookies: any;
}