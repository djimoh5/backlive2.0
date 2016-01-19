var BaseService = require("./BaseService.js");
var spawner = require('child_process');

function StrategyService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
    
    this.getStrategies = function() {
        var query = { name:{ $ne:null }, uid:user.uid };
        db.mongo.collection('log_bt').find(query).sort({"_id":1}, function(err, cursor) {
            cursor.toArray(function(err, results) {
                self.done(results);
            });
        });
        
        return self.promise;
    }
    
    this.save = function(strategyId, name) {
        var oid = new db.ObjectID(strategyId);
        var collection = db.mongo.collection('log_bt');
        
        collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
            if(err) { self.done({ "success":0 }); return; }
            
            if(doc) {
                doc.name = name;

                collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                    if(err)
                        self.done({ "success":0 });
                    else
                        self.done({ "success":1 });
                });
            }
            else
                self.done({ "success":0 });
        });
        
        return self.promise;
    }
    
    this.remove = function(strategyId) {
        var oid = new db.ObjectID(strategyId);  
        var collection = db.mongo.collection("log_bt");
        
        collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
            if(doc && !doc.live) {
                collection.remove({ _id:oid, uid:user.uid }, function() {
                    db.mongo.collection("log_bt_cp", function(error, collection) {
                        collection.remove({ id:oid }, function() {
                            db.mongo.collection("log_bt_tr", function(error, collection) {
                                collection.remove({ id:oid }, function() {
                                    self.done({ "success":1 });
                                });
                            });
                        });
                    });
                });
            }
            else
                self.done({ "success":0, "msg":(doc.live ? "Live strategies cannot be removed. Please first stop automation." : "") });
        });
        
        return this.promise;
    }
    
    this.share = function(strategyId, username, isPublic) {
        var oid = new db.ObjectID(strategyId);
        var collection;
        
        if(isPublic) {
            collection = db.mongo.collection("log_bt");
            collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
                if(err) { self.done({ success:0, msg:"an unexpected error occurred" }); return; }
                
                if(doc) {
                    doc.pub = isPublic;
                    collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                        if(err)
                            self.done({ success:0, msg:"an unexpected error occurred" });
                        else
                            self.done({ success:1, msg:'your backtests have been made public to all users' });
                    });
                }
            });
        }
        else {
            collection = db.mongo.collection("user");
            collection.findOne({ u:username }, { _id:1, e:1 }, function(err, result) {
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
                                    self.done({ success:1, msg:'your backtests have been shared successfully', email:email, id:bt._id });
                                });
                            }
                            else
                                self.done({ success:0, msg:"the backtest does not exist" });
                        });
                    });
                }
                else
                    self.done({ success:0, msg:"the user does not exist" });
            });
        }
        
        return self.promise;
	}
    
    this.automate = function(strategyId, startCapital) {
        var oid = new db.ObjectID(strategyId);
		var collection = db.mongo.collection('log_bt');
        
        collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
            if(err) { self.done({ "success":0 }); return; }
            
            if(doc) {
                doc.live = 1;

                collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                    if(err)
                        self.done({ "success":0 });
                    else {
                        //add to automation table
                        db.mongo.collection('user_stgy', function(err, collection) {
                            var obj = { bt_id:strategyId, uid:user.uid, capt:startCapital, date:(new Date()).getTime(), active:1 };
                            collection.update({ bt_id:strategyId }, obj, { upsert:true }, function(err) {
                                if(err)
                                    self.done({ "success":0 });
                                else {
                                    self.done({ "success":1 });
                                    
                                    //kick off process to update first strategy positions
                                    var proc = spawner.fork('scripts/strategy.js');
                                    proc.send({ bt_id:obj.bt_id });
                                }
                            });
                        });
                        self.done({ "success":1 });
                    }
                });
            }
            else
                self.done({ "success":0 });
        });
        
        return self.promise;
	}
	
    this.stopAutomation = function(strategyId) {
        var oid = new db.bson.ObjectID(strategyId);       
        var collection = db.mongo.collection('log_bt');
        
        collection.findOne({ _id:oid, uid:user.uid }, function(err, doc) {
            if(err) { self.done({ "success":0 }); return; }
            
            if(doc) {
                doc.live = 0;

                collection.update({ _id:oid, uid:user.uid }, doc, function(err) {
                    if(err)
                        self.done({ "success":0 });
                    else {
                        //update automation table
                        db.mongo.collection('user_stgy').update({ bt_id: strategyId }, { $set:{ active:0 } }, function(err) {
                            if(err)
                                self.done({ "success":0 });
                            else
                                self.done({ "success":1 });
                        });
                    }
                });
            }
            else
                self.done({ "success":0 });
        });
        
        return self.promise;
    }
}

StrategyService.inherits(BaseService);
module.exports = StrategyService;