import { NodeService } from './node.service';
import { StrategyRepository } from '../repository/strategy.repository';

import { Session } from '../lib/session';
import { Common } from '../../ui/src/app/utility/common';

import { Strategy } from './model/strategy.model';

var spawner = require('child_process');

export class StrategyService extends NodeService<Strategy> {
    strategyRepository: StrategyRepository;

    constructor(session: Session) {
        super(session, StrategyRepository);
        this.strategyRepository = this.nodeRepository;
    }

    getBacktests() {
        var query = { name:{ $ne:null }, uid: this.user.uid };
        this.database.collection('log_bt').find(query).sort({"_id":1}).toArray((err, results) => {
            this.done(results);
        });
        
        return this.promise;
    }
    
    getReturns(strategyIds, startDate, endDate) {
        var start = Common.parseDate(startDate, 3).getTime();
        var end = Common.parseDate(endDate, 3).getTime();

        var collection = this.database.collection('user_stgy');
        collection.find({ bt_id: { $in: strategyIds } }).toArray((err, strats) => {
            if(err) { this.error(err); return; }
            
            var btMap = {};
            var stratIds = strats.map((s) => {
                btMap[s._id] = s.bt_id;
                return s._id.toString(); 
            });

            collection = this.database.collection('user_stgy_cp');
            collection.find({ id: { $in: stratIds } }).min({ date: start }).max({ date: end }).sort({ _id:1, date: 1})
                .toArray((err, results) => {
                    if(err) { this.error(err); return; }
                    
                    var byStrat = {};
                    results.forEach((result) => {
                        if(!byStrat[result.id]) {
                            byStrat[result.id] = { bt_id: btMap[result.id], returns: [] };
                        }
                        
                        byStrat[result.id].returns.push({ capital: result.capital, date: Common.dbDate(new Date(result.date)) });
                    });
                    
                    this.success(byStrat);
                });
        });

        return this.promise;
    }
    
    saveBacktest(backtestId, name) {
        var oid = this.dbObjectId(backtestId);
        var collection = this.database.collection('log_bt');
        
        collection.findOne({ _id:oid, uid: this.user.uid }, (err, doc) => {
            if(err) { this.error(err); return; }
            
            if(doc) {
                doc.name = name;

                collection.update({ _id:oid, uid: this.user.uid }, doc, (err) => {
                    if(err) {
                        this.error(err);
                    }
                    else {
                        this.success();
                    }
                });
            }
            else {
                this.error(null);
            }
        });
        
        return this.promise;
    }
    
    removeBacktest(backtestId) {
        var oid = this.dbObjectId(backtestId);  
        var collection = this.database.collection("log_bt");
        
        collection.findOne({ _id:oid, uid: this.user.uid }, (err, doc)  => {
            if(doc && !doc.live) {
                collection.remove({ _id:oid, uid: this.user.uid }, () => {
                    this.database.collection("log_bt_cp", (error, collection) => {
                        collection.remove({ id:oid }, () => {
                            this.database.collection("log_bt_tr", (error, collection) => {
                                collection.remove({ id:oid }, () => {
                                    this.success();
                                });
                            });
                        });
                    });
                });
            }
            else {
                this.error(doc.live ? "Live strategies cannot be removed. Please first stop automation." : "");
            }
        });
        
        return this.promise;
    }
    
    shareBacktest(backtestId, username, isPublic) {
        var oid = this.dbObjectId(backtestId);
        var collection;
        
        if(isPublic) {
            collection = this.database.collection("log_bt");
            collection.findOne({ _id:oid, uid: this.user.uid }, (err, doc) => {
                if(err) { this.done({ success:0, msg:"an unexpected error occurred" }); return; }
                
                if(doc) {
                    doc.pub = isPublic;
                    collection.update({ _id:oid, uid: this.user.uid }, doc, (err) => {
                        if(err) {
                            this.error("an unexpected error occurred");
                        }
                        else {
                            this.done({ success:1, msg:'your backtests have been made public to all users' });
                        }
                    });
                }
            });
        }
        else {
            collection = this.database.collection("user");
            collection.findOne({ u:username }, { _id:1, e:1 }, (err, result) => {
                if(result) {
                    var uid = result._id.toString();
                    var email = result.e;
                    
                    this.database.collection("log_bt", (error, collection) => {
                        collection.findOne({ _id:oid, uid: this.user.uid }, (err, result) => {
                            if(result) {
                                var bt = result;
                                bt.ref_id = bt._id;
                                bt.ref_u = this.user.username;
                                bt.uid = uid;
                                bt.date = (new Date()).getTime();
                                
                                delete bt._id;
                                    
                                collection.insert(bt, () => {
                                    this.done({ success:1, msg:'your backtests have been shared successfully', email:email, id:bt._id });
                                });
                            }
                            else {
                                this.error("the backtest does not exist");
                            }
                        });
                    });
                }
                else {
                    this.error("the user does not exist");
                }
            });
        }
        
        return this.promise;
	}
    
    getAutomatedStrategy(backtestId) {
        this.database.collection('user_stgy').findOne({ uid: this.user.uid, bt_id:backtestId }, (err, result)  => {
            if(result) {
                this.database.collection('user_stgy_tr').find({ id:result._id.toString() }).sort({ date:1 }).toArray((err, data) => {
                    this.done({ id:result._id, bt_id:result.bt_id, capt:result.capt, exec:result.exec, data:data });
                });
            }
            else {
                this.error(null);
            }
        });
        
        return this.promise;
    }

    automateStrategy(backtestId, startCapital) {
        var oid = this.dbObjectId(backtestId);
		var collection = this.database.collection('log_bt');
        
        collection.findOne({ _id:oid, uid: this.user.uid }, (err, doc) => {
            if(err) { this.done({ "success":0 }); return; }
            
            if(doc) {
                doc.live = 1;

                collection.update({ _id:oid, uid: this.user.uid }, doc, (err) => {
                    if(err) {
                        this.done({ "success":0 });
                    }
                    else {
                        //add to automation table
                        var obj = { bt_id:backtestId, uid: this.user.uid, capt:startCapital, date:(new Date()).getTime(), active:1 };
                        
                        this.database.collection('user_stgy').update({ bt_id:backtestId }, obj, { upsert:true }, (err)  => {
                            if(err) {
                                this.done({ "success":0 });
                            }
                            else {
                                this.done({ "success":1 });
                                
                                //kick off process to update first strategy positions
                                var proc = spawner.fork('scripts/strategy.js');
                                proc.send({ bt_id:obj.bt_id });
                            }
                        });

                        this.done({ "success":1 });
                    }
                });
            }
            else {
                this.done({ "success":0 });
            }
        });
        
        return this.promise;
	}
	
    stopAutomation(strategyId) {
        var oid = this.dbObjectId(strategyId);       
        var collection = this.database.collection('log_bt');
        
        collection.findOne({ _id:oid, uid: this.user.uid }, (err, doc) => {
            if(err) { this.done({ "success":0 }); return; }
            
            if(doc) {
                doc.live = 0;

                collection.update({ _id:oid, uid: this.user.uid }, doc, (err) => {
                    if(err) {
                        this.done({ "success":0 });
                    }
                    else {
                        //update automation table
                        this.database.collection('user_stgy').update({ bt_id: strategyId }, { $set:{ active:0 } }, (err) => {
                            if(err) {
                                this.done({ "success":0 });
                            }
                            else {
                                this.done({ "success":1 });
                            }
                        });
                    }
                });
            }
            else {
                this.done({ "success":0 });
            }
        });
        
        return this.promise;
    }
    
    markStrategyAsExecuted(strategyId, date) {
        var oid = this.dbObjectId(strategyId);
                    
        this.database.collection('user_stgy').update({ _id: oid, uid: this.user.uid }, { $set:{ exec: date } }, (err) => {
            this.done({ "success":err ? 0 : 1 });
        });
    }
}