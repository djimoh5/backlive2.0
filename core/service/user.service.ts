import { BaseService } from './base.service';
import { Session } from '../lib/session';

import { Config } from '../config';
import { Database as db } from '../lib/database';
import { Common } from '../../app/utility/common';

export class UserService extends BaseService {
    constructor(session: Session) {
        super(session);
    }
    
    login(uname: string, pword: string) {
        var uuid = require('node-uuid');
        var md5 = require('../.' + Config.DIR_JS + 'md5.min');
        
        db.mongo.collection('user', (error, collection) => {
            collection.find({ u:uname }).toArray((err, results) =>{
                if(results.length > 0) {
                    var upw = results[0].p;
                    var salt = upw.substring(11, 15);
                    var hexPw = md5(salt + pword + Session.pwSalt);

                    if(hexPw == (upw.substring(0, 11) + upw.substring(15))) {
                        var sessId = md5(uuid.v1());
                        var uid = results[0]._id.toString();
                        
                        Session.users[sessId] = { uid: uid, token: sessId, sessId: sessId, username: results[0].u, email: results[0].e, btuid: results[0].btuid, btpid: results[0].btpid, created: results[0].created };
                        this.user = Session.users[sessId];
                        
                        //whether user has seen tour or not
                        //if(results[0].tr_r) this.user.tr_r = 1;
                        //if(results[0].tr_b) this.user.tr_b = 1;
                        //if(results[0].tr_p) this.user.tr_p = 1;
                        
                        this.session.cookies.set(Session.sessionIdName, sessId);
                        
                        //persist session to DB
                        db.mongo.collection('session', (error, collection) => {
                            collection.update({ uid:uid }, { uid:uid, token:sessId, sessId: sessId, date:(new Date).getTime() }, { upsert:true });
                        });
                    }
                    else {
                        this.user = { error:'the username or password is incorrect', uid: null };
                    }
                }
                else {
                    this.user = { error:'the username or password is incorrect', uid: null };
                }
                    
                this.done(this.user);
            });
    	});

        return this.promise;
    }

    logout() {
        this.session.cookies.set(Session.sessionIdName, null);
        delete Session.users[this.user.token];
    }
    
    register(uname: string, pword: string, email: string) {
        if(uname && uname.length >= 4 && pword && pword.length >= 4 && email && Common.validEmail(email)) {
            var md5 = require('../.' + Config.DIR_JS + 'md5.min');
            
            db.mongo.collection('user', (error, collection) => {
                collection.find({ u:uname }).toArray((err, results) => {
                    if(results.length > 0) {
                        this.done({ error:'the user already exists', uid: null });
                    }
                    else {
                        var salt = this.generateSalt();
                        var hexPw = md5(salt + pword + Session.pwSalt);
                        hexPw = hexPw.substring(0, 11) + salt + hexPw.substring(11);
                        var doc: any = { u:uname, p:hexPw, e:email, created:(new Date()).getTime() };
            
                        collection.insert(doc, { safe:true }, () => {
                            //load default backtests
                            /*var newUid = doc._id.toString();
                            var tests = ["53d3c0a9641898a335c0c1ea", "53d3bf0f641898a335c0c1e5", "53d3be44641898a335c0c1e4"];
                            
                            db.mongo.collection("log_bt", (error, collection) => {
                                for(var i = 0, len = tests.length; i < len; i++) {
                                    var oid = new db.ObjectID(tests[i]);
                    	            collection.findOne({ _id:oid }, (err, result) => {
                    	                if(result) {
                        				    var bt = result;
                        				    bt.ref_id = bt._id;
                        				    bt.uid = newUid;
                        				    bt.date = (new Date()).getTime();
                                	        
                                	        delete bt._id;
                                	        collection.insert(bt);
                    	                }
                    				});
                                }
                            });*/
                            
                            this.login(uname, pword).then(user => {
                                this.done(user);
                            });
                        });
                    }
                });
    		});
        }
        else {
            this.done({ error:'name and password length must be greater than 4, and email in form abs@xyz.com', uid: null });
        }

        return this.promise;
    }

    changePassword(opword: string, npword: string) {
        var md5 = require('../.' + Config.DIR_JS + 'md5.min');
        var oid = new db.ObjectID(this.user.uid);

        db.mongo.collection('user', (error, collection) => {
            collection.findOne({ _id:oid }, { p:1 }, (err, result) => {
                if(result) {
                    if(npword && npword.length >= 4) {
                        var upw = result.p;
                        var salt = upw.substring(11, 15);
                        var hexPw = md5(salt + opword + Session.pwSalt);
    
                        if(hexPw == (upw.substring(0, 11) + upw.substring(15))) {
                            //current password matches, create new one
                            salt = this.generateSalt();
                            hexPw = md5(salt + npword + Session.pwSalt);
                            hexPw = hexPw.substring(0, 11) + salt + hexPw.substring(11);
                            
                            collection.update({ _id:oid }, { $set:{ p:hexPw } }, () => {
                                this.success(); 
                            });
                        }
                        else {
                            this.error('the existing password is incorrect');
                        }
                    }
                    else {
                        this.error('new password must be at least 4 chars');
                    }
                }
                else {
                    this.error('user does not exist');
                }
            });
    	});

        return this.promise;
    }
    
    forgotPassword(uname: string) {
        var md5 = require('../.' + Config.DIR_JS + 'md5.min');

        db.mongo.collection('user', (error, collection) => {
            collection.findOne({ u:uname }, (err, result) => {
                if(result) {
                    var pw = this.generatePassword(8);
                    var salt = this.generateSalt();
                    var hexPw = md5(salt + pw + Session.pwSalt);
                    hexPw = hexPw.substring(0, 11) + salt + hexPw.substring(11);

                    collection.update({ _id:result._id }, { $set:{ p:hexPw } }, () => {
                        this.done({ success:1, pw:pw, e:result.e });
                    });
                }
                else {
                    this.error('user does not exist');
                }
            });
    	});

        return this.promise;
    }
    
    updateCustomern(custId, payToken) {
        db.mongo.collection('user', (error, collection) => {
            var oid = new db.ObjectID(this.user.uid);
            var obj = { btuid:custId, btpt:payToken };
            
            collection.update({ _id:oid }, { $set:obj }, () => {
                this.user.btuid = custId;
                this.success();
            });
    	});

        return this.promise;
    }
    
    updateSubscription(planId, subscrId, payToken) {
        db.mongo.collection('user', (error, collection) => {
            var oid = new db.ObjectID(this.user.uid);
            
            collection.update({ _id:oid }, { $set:{ btpid:planId, btsid:subscrId, btpt:payToken } }, () => {
                this.user.btpid = planId;
                this.success();
            });
    	});
        
        return this.promise;
    }
    
    getSubscription(callback: Function) {
        db.mongo.collection('user', (error, collection) => {
            var oid = new db.ObjectID(this.user.uid);

            collection.findOne({ _id:oid }, { btsid:1, btpt:1 }, (error, result) => {
                this.done(result);
            });
    	});

        return this.promise;
    }

    private generatePassword(pwordLen: number) {
		var special = "$!#&*";
	    var alpha = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
	    var pword = "";

	    for(var i = 0; i < pwordLen; i++) {
	        if(Math.round(Math.random() * 100) % 4 == 0) {
	        	pword += special[Math.round(Math.random() * (special.length - 1))];
            }
			else {
			    pword += alpha[Math.round(Math.random() * (alpha.length - 1))];
            }
	    }
	
		return pword;
	}
    
    private generateSalt() {
        var salt = '', chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        for(var i = 0; i < 4; i++) {
            salt += chars[Math.floor(Math.random() * 36)];
        }
        
        return salt;
    }
}