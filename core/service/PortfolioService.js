var BaseService = require("./BaseService.js");

function PortfolioService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
     
    this.getPortfolio = function() {
        db.mongo.collection('user_pf').find({ uid:user.uid }).sort({ date:1 }).toArray(function(err, results) {
            if(err) self.error();
            else self.done(results);
        });

        return self.promise;
    }
    
    this.addTrade = function(trade) {
        trade.uid = user.uid;
        var collection = db.mongo.collection('user_pf');
    
        if(trade.id) {
            var oid = new db.ObjectID(trade.id);
            delete trade.id;
            collection.update({ _id:oid }, { $set:trade }, function(err) {
                self.done({ "success":err ? 0 : 1 });
            });
        }
        else {
            collection.insert(trade, function(err) {
                self.done({ "success":err ? 0 : 1, id:trade._id });
            });
        }
                            
        return self.promise;
    }
    
    this.batchAddTrades = function(trades) {
        var collection = db.mongo.collection('user_pf');
        var cnt = trades.length;
        var batchErr = false;
        
        for(var i = 0, len = trades.length; i < len; i++) {
            trades[i].uid = user.uid;
            
            collection.insert(trades[i], function(err) {
                if(err) batchErr = err;
                
                if(--cnt == 0)
                    self.done({ "success":batchErr ? 0 : 1 });
            });
        }
        
        return self.promise;
    }
    
    this.removeTrade = function(tradeId) {
        var oid = new db.ObjectID(tradeId);
        
        db.mongo.collection("user_pf").remove({ _id:oid, uid:user.uid }, function() {
            self.success();
        });
                    
        return self.promise;
    }
    
    this.clearPortfolio = function() {
        db.mongo.collection("user_pf").remove({ uid:user.uid }, function() {
            self.success();
        });
                
        return self.promise;
    }
}

PortfolioService.inherits(BaseService);
module.exports = PortfolioService;