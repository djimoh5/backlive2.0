var BaseService = require("./BaseService.js");
var Scraper = require("../lib/Scraper.js");
var Common = require("../utility/Common.js");

function TickerService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
        
    this.getPrices = function(ticker, years) {
        var today = new Date(),
            query = { ticker: ticker };
        
        if(years) {
            query.date = { $gt:(today.format(1) - (years * 10000)) };
        }
        console.log(query);
    	db.mongo.collection('market').find(query, {date:1, close:1, adjClose:1, open: 1, high:1, low:1, volume:1, time:1}).sort({date:1}).toArray(function(err, results) {
            if(results.length > 0) {
                var date = results[results.length - 1].date;
                var time = results[results.length - 1].time;
                
                if(!Common.isNumber(date))
                    results = [];
            }
            
            if(results.length == 0 || ((time + 3600000) < today.getTime() && date < today.format(1))) {
                if(query.ticker == 'SP500')
                    query.ticker = '^GSPC'
                        
                //scrape the data
                Scraper.loadPricing(query.ticker, null, function(results) {
                    finish(results);
                });
            }
            else {
                years = null; //doesn't need to be spliced since we already selected the correct timeframe
                finish(results);
            }
            
            function finish(results) {
                if(years) {
                    var days = years * 252;
                    var len = results.length;
                    
                    if(len > days)
                        self.done(results.splice(len - days));
                    else
                        self.done(results);
                }
                else
                    self.done(results);
            }
        });
        
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
}

TickerService.inherits(BaseService);
module.exports = TickerService;