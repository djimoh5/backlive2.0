var Cookies = require('cookies');
var users = {};
var processes = {};

//load user sessions from DB
db.mongo.collection('session', function(error, collection) {
    collection.find({}).toArray(function(err, results) {
        for(var i = 0, cnt = results.length; i < cnt; i++) {
            users[results[i].sessId] = { uid: results[i].uid, token: results[i].token, sessId: results[i].sessId };
        }
    });
});

Session = function(request, response) {
    var session = this, sessionIdName = 'bti_se$$_id', pwSalt = 'bL1$3', user;  
    var cookies = new Cookies(request, response);
    var sessionId = cookies.get(sessionIdName);
    
    if(sessionId)
        user = users[sessionId];
    
    if(!user)
        user = { error:'no session id', uid:0 };
    else if(!user.name) {
        var oid = new db.ObjectID(user.uid);
        
        db.mongo.collection('user', function(error, collection) {
            collection.findOne({ _id:oid }, function(err, result) {
                user.name = result.u;
                user.email = result.e;
                user.btuid = result.btuid;
                user.btpid = result.btpid;
                user.created = result.created;
            });
        });
    }

    this.user = user;
    
    this.login = function(uname, pword, callback) {
        var uuid = require('node-uuid');
        var md5 = require('../.' + DIR_JS + 'md5');
        //var hexPw = md5.hex_md5(pword);
        
        db.mongo.collection('user', function(error, collection) {
            collection.find({ u:uname }).toArray(function(err, results) {
                if(results.length > 0) {
                    var upw = results[0].p;
                    var salt = upw.substring(11, 15);
                    var hexPw = md5.hex_md5(salt + pword + pwSalt);

                    if(hexPw == (upw.substring(0, 11) + upw.substring(15))) {
                        var sessId = md5.hex_md5(uuid.v1());
                        var uid = results[0]._id.toString();
                        
                        users[sessId] = { uid:uid, token:sessId, sessId: sessId, name:results[0].u, email:results[0].e, btuid:results[0].btuid, btpid:results[0].btpid, created:results[0].created };
                        user = users[sessId];
                        
                        //whether user has seen tour or not
                        if(results[0].tr_r) user.tr_r = 1;
                        if(results[0].tr_b) user.tr_b = 1;
                        if(results[0].tr_p) user.tr_p = 1;
                        
                        cookies.set(sessionIdName, sessId);
                        
                        //persist session to DB
                        db.mongo.collection('session', function(error, collection) {
                            collection.update({ uid:uid }, { uid:uid, token:sessId, sessId: sessId, date:(new Date).getTime() }, { upsert:true });
                        });
                    }
                    else
                        user = { error:'the username or password is incorrect' };
                }
                else
                    user = { error:'the username or password is incorrect' };
                    
                callback(user);
            });
    	});
    }
    
    this.logout = function(callback) {
        cookies.set(sessionIdName, null);
        delete users[sessionId];
        callback();
    }
    
    this.register = function(uname, pword, email, callback) {
        if(uname && uname.length >= 4 && pword && pword.length >= 4 && email && u.validEmail(email)) {
            var md5 = require('../.' + DIR_JS_LIB + 'md5');
            
            db.mongo.collection('user', function(error, collection) {
                collection.find({ u:uname }).toArray(function(err, results) {
                    if(results.length > 0)
                        callback({ error:'the user already exists' });
                    else {
                        var salt = session.generateSalt();
                        var hexPw = md5.hex_md5(salt + pword + pwSalt);
                        hexPw = hexPw.substring(0, 11) + salt + hexPw.substring(11);
                        var doc = { u:uname, p:hexPw, e:email, created:(new Date()).getTime() };
            
                        collection.insert(doc, { safe:true }, function() {
                            //load default backtests
                            var newUid = doc._id.toString();
                            var tests = ["53d3c0a9641898a335c0c1ea", "53d3bf0f641898a335c0c1e5", "53d3be44641898a335c0c1e4"];
                            
                            db.mongo.collection("log_bt", function(error, collection) {
                                for(var i = 0, len = tests.length; i < len; i++) {
                                    var oid = new db.ObjectID(tests[i]);
                    	            collection.findOne({ _id:oid }, function(err, result) {
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
                            });
                            
                            session.login(uname, pword, callback);
                        });
                    }
                });
    		});
        }
        else
            callback({ error:'name and password length must be greater than 4, and email in form abs@xyz.com' });
    }
    
    this.changePassword = function(opword, npword, callback) {
        var md5 = require('../.' + DIR_JS_LIB + 'md5');
        var oid = new db.ObjectID(user.uid);
        //console.log(opword, npword);

        db.mongo.collection('user', function(error, collection) {
            collection.findOne({ _id:oid }, { p:1 }, function(err, result) {
                if(result) {
                    if(npword && npword.length >= 4) {
                        var upw = result.p;
                        var salt = upw.substring(11, 15);
                        var hexPw = md5.hex_md5(salt + opword + pwSalt);
    
                        if(hexPw == (upw.substring(0, 11) + upw.substring(15))) {
                            //current password matches, create new one
                            var salt = session.generateSalt();
                            var hexPw = md5.hex_md5(salt + npword + pwSalt);
                            hexPw = hexPw.substring(0, 11) + salt + hexPw.substring(11);
                            
                            collection.update({ _id:oid }, { $set:{ p:hexPw } }, function() {
                                callback({ success:1 }); 
                            });
                        }
                        else
                            callback({ success:0, msg:'the existing password is incorrect' });
                    }
                    else
                        callback({ success:0, msg:'new password must be at least 4 chars' });
                }
                else
                    callback({ success:0, msg:'user does not exist' });
            });
    	});
    }
    
    this.forgotPassword = function(uname, callback) {
        var md5 = require('../.' + DIR_JS_LIB + 'md5');

        db.mongo.collection('user', function(error, collection) {
            collection.findOne({ u:uname }, function(err, result) {
                if(result) {
                    var pw = session.generatePassword(8);
                    var salt = session.generateSalt();
                    var hexPw = md5.hex_md5(salt + pw + pwSalt);
                    hexPw = hexPw.substring(0, 11) + salt + hexPw.substring(11);

                    collection.update({ _id:result._id }, { $set:{ p:hexPw } }, function() {
                        callback({ success:1, pw:pw, e:result.e });
                    });
                }
                else
                    callback({ success:0, msg:'user does not exist' });
            });
    	});
    }
    
    this.generatePassword = function(pwordLen) {
		var special = "$!#&*";
	    var alpha = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
	    var pword = "";

	    for(var i = 0; i < pwordLen; i++) {
	        if(Math.round(Math.random() * 100) % 4 == 0)
	        	pword += special[Math.round(Math.random() * (special.length - 1))];
			else
			    pword += alpha[Math.round(Math.random() * (alpha.length - 1))];
	    }
	
		return pword;
	}
    
    this.generateSalt = function() {
        var salt = '', chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        for(var i = 0; i < 4; i++) {
            salt += chars[Math.floor(Math.random() * 36)];
        }
        
        return salt;
    }
    
    this.updateCustomer = function(custId, payToken, callback) {
        db.mongo.collection('user', function(error, collection) {
            var oid = new db.ObjectID(user.uid);
            var obj = { btuid:custId, btpt:payToken };
            
            collection.update({ _id:oid }, { $set:obj }, function() {
                user.btuid = custId;
                callback({ success:1 });
            })
    	});
    }
    
    this.updateSubscription = function(planId, subscrId, payToken, callback) {
        db.mongo.collection('user', function(error, collection) {
            var oid = new db.ObjectID(user.uid);
            
            collection.update({ _id:oid }, { $set:{ btpid:planId, btsid:subscrId, btpt:payToken } }, function() {
                user.btpid = planId;
                callback({ success:1 });
            });
    	});
    }
    
    this.getSubscription = function(callback) {
        db.mongo.collection('user', function(error, collection) {
            var oid = new db.ObjectID(user.uid);

            collection.findOne({ _id:oid }, { btsid:1, btpt:1 }, function(error, result) {
                callback(result);
            });
    	});
    }
    
    this.addProcess = function(id, process) {
        processes[id] = process;
    }
    
    this.removeProcess = function(id) {
        delete processes[id];
    }
    
    this.process = function(id) {
        return processes[id];
    }
}