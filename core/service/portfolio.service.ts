import { BaseService } from './base.service';
import { Session } from '../lib/session';

export class PortfolioService extends BaseService {
    constructor(session: Session) {
        super(session);
    }

    getPortfolio() {
        this.database.collection('user_pf').find({ uid: this.user.uid }).sort({ date:1 }).toArray((err, results) => {
            if(err) this.error(null);
            else this.done(results);
        });

        return this.promise;
    }
    
    addTrade(trade) {
        trade.uid = this.user.uid;
        var collection = this.database.collection('user_pf');
    
        if(trade.id) {
            var oid = this.dbObjectId(trade.id);
            delete trade.id;
            collection.update({ _id:oid }, { $set:trade }, (err) => {
                this.done({ "success":err ? 0 : 1 });
            });
        }
        else {
            collection.insert(trade, (err) => {
                this.done({ "success":err ? 0 : 1, id:trade._id });
            });
        }
                            
        return this.promise;
    }
    
    batchAddTrades(trades) {
        var collection = this.database.collection('user_pf');
        var cnt = trades.length;
        var batchErr = false;
        
        for(var i = 0, len = trades.length; i < len; i++) {
            trades[i].uid = this.user.uid;
            
            collection.insert(trades[i], (err) => {
                if(err) batchErr = err;
                
                if(--cnt == 0)
                    this.done({ "success":batchErr ? 0 : 1 });
            });
        }
        
        return this.promise;
    }
    
    removeTrade(tradeId) {
        var oid =this.dbObjectId(tradeId);
        
        this.database.collection("user_pf").remove({ _id:oid, uid:this.user.uid }, () => {
            this.success(null);
        });
                    
        return this.promise;
    }
    
    clearPortfolio() {
        this.database.collection("user_pf").remove({ uid:this.user.uid }, () => {
            this.success(null);
        });
                
        return this.promise;
    }
}