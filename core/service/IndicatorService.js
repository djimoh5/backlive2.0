var BaseService = require("./BaseService.js");

function IndicatorService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
        
    this.getIndicators = function() {
		var collection = db.mongo.collection('user_ind');
        
        collection.find({ uid:user.uid }).toArray(function(err, results) {
            if(err) {
                console.log('Mongo Exception: ' + err.message);
                self.done({ success: 0 });
            }
            else {			
                if(user.uid == 0)
                    self.done(results);
                else {
                    //get global indicators (user = 0)
                    collection.find({ uid:0 }).toArray(function(err, gResults) {
                        self.done(gResults.concat(results));
                    });
                }
            }
        });
        
        return self.promise;
    }
    
    this.saveIndicator = function(indicator) {
	    indicator.uid = user.name == 'v1user' ? 0 : user.uid;
            
        db.mongo.collection("user_ind").insert(indicator, function() {
            self.done({ "success": 1, "id": indicator._id });
        });
        
        return self.promise;
    }
    
	this.removeIndicator = function(indicatorId) {
        var oid = new db.ObjectID(indicatorId);
        var uid = user.name == 'v1user' ? 0 : user.uid;

        db.mongo.collection("user_ind").remove({ _id:oid, uid:uid }, function() {
            self.done({ "success":1 });
        });
        
        return self.promise;
    }
    
    this.getIndicatorsForTicker = function(tkr) {
		
        return self.promise;
    }
}

IndicatorService.inherits(BaseService);
module.exports = IndicatorService;