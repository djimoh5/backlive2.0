var BaseService = require("./BaseService.js");

function UserService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
    //console.log(user);

    this.register = function(params) {
    	session.register(params.username, params.password, params.email, self.done);
        return self.promise;
	}
    
    this.login = function(params) {
        session.login(params.username, params.password, self.done);
        return self.promise;
	}
    
    this.logout = function(params) {
        session.logout(function() {
            self.done({ success:1 });
        });
        return self.promise;
    }
    
    this.password = function(params) {
        session.changePassword(params[0].opword, params[0].npword, self.done);
        return self.promise;
    }
    
    this.forgotpassword = function(params) {
        session.forgotPassword(params.username, self.done);
        return self.promise;
    }
	
	this.getIndicators = function(params) {
		db.mongo.collection('user_ind', function(error, collection) {
			collection.find({ uid:user.uid }).toArray(function(err, results) {
				if(err)
					console.log('Mongo Exception: ' + err.message);
				else {			
                    if(user.uid == 0)
					    callback(results);
                    else {
                        //get global indicators (user = 0)
                        collection.find({ uid:0 }).toArray(function(err, gResults) {
                            callback(gResults.concat(results));
                        });
                    }
				}
			});
		});
	}
	
	/*this.indicator = function(params) {
		if(params[0] == 'save') {
			var ind = params[1];
            ind.uid = user.name == 'v1user' ? 0 : user.uid;
            
			db.mongo.collection("user_ind", function(error, collection) {
				collection.insert(ind, function() {
					callback({ "success":1, "id":ind._id });
				});
			});
		}
        else if(params[0] == 'remove') {
            var oid = new db.bson.ObjectID(params[1].id);
            var uid = user.name == 'v1user' ? 0 : user.uid;

			db.mongo.collection("user_ind", function(error, collection) {
				collection.remove({ _id:oid, uid:uid }, function() {//, uid:user.uid }, function() {
					callback({ "success":1 });
				});
			});
		}
		else
			callback({ "success":0 });
	}
    
    this.backtest = function(params) {
        //console.log(params);
        if(params[0] == 'get') {
            var query = { name:{ $ne:null }, uid:user.uid };
            db.mongo.collection('log_bt', function(error, collection) {
        		collection.find(query).sort({"_id":1}, function(err, cursor) {
    				cursor.toArray(function(err, results) {	
    					callback(results);
    				});
    			});
    		});
        }
    	else if(params[0] == 'save') {
            db.mongo.collection('log_bt', function(err, collection) {
                if(err) { callback({ "success":0 }); return; }
                
                var oid = new db.bson.ObjectID(params[1].id);
                
        		collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
                    if(err) { callback({ "success":0 }); return; }
                    
                    if(doc) {
                        doc.name = params[1].name;
    
                        collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                            if(err)
                                callback({ "success":0 });
                            else
                                callback({ "success":1 });
                        });
                    }
                    else
                        callback({ "success":0 });
    			});
    		});
		}
        else if(params[0] == 'remove') {
            var oid = new db.bson.ObjectID(params[1].id);
            //console.log(oid);

			db.mongo.collection("log_bt", function(error, collection) {
			    collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
			        if(doc && !doc.live) {
        				collection.remove({ _id:oid, uid:user.uid }, function() {
                            db.mongo.collection("log_bt_cp", function(error, collection) {
                        		collection.remove({ id:oid }, function() {
                					db.mongo.collection("log_bt_tr", function(error, collection) {
                                		collection.remove({ id:oid }, function() {
                        					callback({ "success":1 });
                        				});
                        			});
                				});
                			});
        				});
			        }
			        else
			            callback({ "success":0, "msg":(doc.live ? "Live strategies cannot be removed. Please first stop automation." : "") });
			    });
			});
		}
		else if(params[0] == 'share') {
            var oid = new db.bson.ObjectID(params[1].id);
  
            if(params[1].pub) {
                db.mongo.collection("log_bt", function(error, collection) {
                    collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
                        if(err) { callback({ success:0, msg:"an unexpected error occurred" }); return; }
                        
                        if(doc) {
                            doc.pub = params[1].pub;
                            collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                                if(err)
                                    callback({ success:0, msg:"an unexpected error occurred" });
                                else
                                    callback({ success:1, msg:'your backtests have been made public to all users' });
                            });
                        }
                    });
                });
            }
            else {
                var uname = params[1].uname;
                
                db.mongo.collection("user", function(error, collection) {
        	        collection.findOne({ u:uname }, { _id:1, e:1 }, function(err, result) {
        	            if(result) {
        	                var uid = result._id.toString();
        	                var email = result.e;
        	                
        	                db.mongo.collection("log_bt", function(error, collection) {
                	            collection.findOne({ _id:oid, uid:user.uid }, function(err, result) {
                	                if(result) {
                    				    var bt = result;
                    				    bt.ref_id = bt._id;
                    				    bt.ref_u = user.name;
                    				    bt.uid = uid;
                    				    bt.date = (new Date()).getTime();
                            	        
                            	        delete bt._id;
                            	            
                            	        collection.insert(bt, function() {
                        	                callback({ success:1, msg:'your backtests have been shared successfully', email:email, id:bt._id });
                        	            });
                	                }
                	                else
                	                    callback({ success:0, msg:"the backtest does not exist" });
                				});
                			});
        	            }
        	            else
        	                callback({ success:0, msg:"the user does not exist" });
        	        });
        	    });
            }
		}
		else if(params[0] == 'automate') {
            db.mongo.collection('log_bt', function(err, collection) {
                if(err) { callback({ "success":0 }); return; }
                
                var oid = new db.bson.ObjectID(params[1].id);
                
        		collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
                    if(err) { callback({ "success":0 }); return; }
                    
                    if(doc) {
                        doc.live = 1;
    
                        collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                            if(err)
                                callback({ "success":0 });
                            else {
                                //add to automation table
                                db.mongo.collection('user_stgy', function(err, collection) {
                                    var obj = { bt_id:params[1].id, uid:user.uid, capt:params[1].capt, date:(new Date()).getTime(), active:1 };
                                    collection.update({ bt_id:params[1].id }, obj, { upsert:true }, function(err) {
                                        if(err)
                                            callback({ "success":0 });
                                        else {
                                            callback({ "success":1 });
                                            
                                            //kick off process to update first strategy positions
                                            var proc = spawner.fork('scripts/strategy.js');
                                            proc.send({ bt_id:obj.bt_id });
                                        }
                                    });
                                });
                                callback({ "success":1 });
                            }
                        });
                    }
                    else
                        callback({ "success":0 });
    			});
    		});
		}
		else if(params[0] == 'stopautomate') {
            db.mongo.collection('log_bt', function(err, collection) {
                if(err) { callback({ "success":0 }); return; }
                
                var oid = new db.bson.ObjectID(params[1].id);
                
        		collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
                    if(err) { callback({ "success":0 }); return; }
                    
                    if(doc) {
                        doc.live = 0;
    
                        collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                            if(err)
                                callback({ "success":0 });
                            else {
                                //update automation table
                                db.mongo.collection('user_stgy', function(err, collection) {
                                    collection.update({ bt_id:params[1].id }, { $set:{ active:0 } }, function(err) {
                                        if(err)
                                            callback({ "success":0 });
                                        else
                                            callback({ "success":1 });
                                    });
                                });
                            }
                        });
                    }
                    else
                        callback({ "success":0 });
    			});
    		});
		}
	}
    
    this.portfolio = function(params) {
        if(params[0]) {
            if(params[0] == 'save') {
                if(params[1]) {
                    db.mongo.collection('user_pf', function(err, collection) {
                        if(err) { callback({ "success":0 }); return; }
                        
                        if(params[1].trades) {
                            var trades = params[1].trades;
                            var cnt = trades.length;
                            var batchErr = false;
                            
                            console.log('batch cnt', cnt);
                            for(var i = 0, len = trades.length; i < len; i++) {
                                trades[i].uid = user.uid;
                                
                                collection.insert(trades[i], function(err) {
                                    if(err) batchErr = err;
                                    
                                    if(--cnt == 0)
                                        callback({ "success":batchErr ? 0 : 1 });
                                });
                            }
                        }
                        else {
                            var trade = params[1].trade;
                            trade.uid = user.uid;
    
                            if(trade.id) {
                                var oid = new db.bson.ObjectID(trade.id);
                                delete trade.id;
                                collection.update({ _id:oid }, { $set:trade }, function(err) {
                                    callback({ "success":err ? 0 : 1 });
                                });
                            }
                            else {
                                collection.insert(trade, function(err) {
                                    callback({ "success":err ? 0 : 1, id:trade._id });
                                });
                            }
                        }
            		});
                }
                else
                    callback({ "success":0 });
    		}
            else if(params[0] == 'update') {
                if(params[1]) {
                	db.mongo.collection("user_pf", function(error, collection) {
        				collection.update({ ticker:params[1].ticker, uid:user.uid }, { $set:{ shares:params[1].shares } }, function() {
                            callback({ "success":1 });
        				});
        			});
                }
                else
                    callback({ "success":0 });
    		}
            else if(params[0] == 'remove') {
                console.log(params);
                if(params[1] && params[1].id) {
        			db.mongo.collection("user_pf", function(error, collection) {
        			    var oid = new db.bson.ObjectID(params[1].id);
        			    
        				collection.remove({ _id:oid, uid:user.uid }, function() {
                            callback({ "success":1 });
        				});
        			});
                }
                else
                    callback({ "success":0 });
    		}
            else if(params[0] == 'clear') {
                db.mongo.collection("user_pf", function(error, collection) {
    				collection.remove({ uid:user.uid }, function() {
                        callback({ "success":1 });
    				});
    			});
    		}
    		else if(params[0] == 'strategy') {
                if(params[1] && params[1].id) {
        			db.mongo.collection('user_stgy', function(err, collection) {
                        collection.findOne({ uid:user.uid, bt_id:params[1].id }, function(err, result) {
                            if(result) {
                                db.mongo.collection('user_stgy_tr', function(err, collection) {
                                    collection.find({ id:result._id.toString() }).sort({ date:1 }).toArray(function(err, data) {
                                        callback({ id:result._id, bt_id:result.bt_id, capt:result.capt, exec:result.exec, data:data });
                                    });
                                });
                            }
                            else
                                callback({ "success":0 });
                        });
                    });
                }
                else
                    callback({ "success":0 });
    		}
    		else if(params[0] == 'strategyexec') {
                if(params[1] && params[1].id) {
                    var oid = new db.bson.ObjectID(params[1].id);
                    
        			db.mongo.collection('user_stgy', function(err, collection) {
                        collection.update({ _id:oid, uid:user.uid }, { $set:{ exec:params[1].date } }, function(err) {
                            callback({ "success":err ? 0 : 1 });
                        });
                    });
                }
                else
                    callback({ "success":0 });
    		}
    		else
    			callback({ "success":0 });
        }
        else {
			db.mongo.collection('user_pf', function(error, collection) {
        		collection.find({ uid:user.uid }).sort({ date:1 }).toArray(function(err, results) {
    				if(err) callback({ "success":0 });
    				else callback(results);
    			});
    		});
        }
	}
    
    this.rss = function(params) {
        if(params[0] && params[1]) {
            if(params[0] == 'save') {
                db.mongo.collection('user_rss', function(err, collection) {
                    if(err) { callback({ "success":0 }); return; }
                    var doc = { uid:user.uid, name:params[1].name, rss:params[1].rss };
                    collection.insert(doc, function(err) {
                        if(err)
                            callback({ "success":0 });
                        else
                            callback({ "success":1, id:doc._id });
                    });
            	});
            }
            else if(params[0] == 'remove') {
                db.mongo.collection('user_rss', function(err, collection) {
                    var oid = new db.bson.ObjectID(params[1].id);
        			collection.remove({ _id:oid, uid:user.uid }, function() {
                        callback({ "success":1 });
    				});
                });
            }
            else
        		callback({ "success":0 });
        }
        else {
    		db.mongo.collection('user_rss', function(error, collection) {
        		collection.find({ uid:user.uid }).toArray(function(err, results) {
    				if(err) callback({ "success":0 });
    				else callback(results);
    			});
    		});
        }
    }
    
    this.tour = function(params) {
        var key = null;
        
        if(params[0] == 'research')
            key = 'r';
        else if(params[0] == 'backtest')
            key = 'b';
        else if(params[0] == 'portfolio')
            key = 'p';
            
        if(key != null) {
            db.mongo.collection('user', function(err, collection) {
                if(err) { callback({ "success":0 }); return; }
                
                var oid = new db.bson.ObjectID(user.uid);
                var obj = {};
                obj['tr_' + key] = 1;
    
                collection.update({ _id:oid }, { $set:obj }, function(err) {
                    if(!err)
                        user['tr_' + key] = 1;
                        
                    callback({ "success":err ? 0 : 1 });
                });
        	});
        }
        else
            callback({ "success":0 });
    }
    
    this.alerts = function(params) {
        if(params[0] && params[1]) {
            if(params[0] == 'save') {

            }
            else if(params[0] == 'remove') {

            }
            else
            	callback({ "success":0 });
        }
        else
            callback({ "success":0 });
    }
    
    if(params.length > 0) {
        var method = params.shift();
        var pubMethods = ['register', 'login', 'forgotpassword', 'getIndicators'];
        
        if(user.uid || u.inArray(method, pubMethods)) {
            if(this[method])
                this[method](params);
            else
                callback({});
        }
        else
    	    callback({ "success":0 });
	}
	else
		callback({ "success":0 });*/
}

UserService.inherits(BaseService);
module.exports = UserService;