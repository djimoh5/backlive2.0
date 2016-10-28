var BaseService = require("./BaseService.js");
var Scraper = require("../lib/Scraper.js");
var Common = require("../utility/Common.js");
var whttp = require("../lib/whttp.js");

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
    
    this.getPrice = function(ticker, date) {
        db.mongoPricing.collection(ticker.substring(0, 1).toUpperCase()).findOne({ ticker: ticker, date: parseInt(date) }, { adjClose:1 }, function(err, result) {
            if(result)
                self.done({ success:1, price:result.adjClose });
            else
                self.done({ success:0 });
        });
        
        return self.promise;
    }
    
    this.getLastPrice = function(ticker) {
        //http://download.finance.yahoo.com/d/quotes.csv?s=^DJI&f=sl1c1p2l1bac8
        if(!ticker) {
            ticker = '^GSPC+^DJX+^IXIC'; //,^TNX for 10 year
        }
         
        whttp.get('download.finance.yahoo.com', '/d/quotes.csv?s=' + ticker + '&f=sl1c1p2bac8', function(data) {
            data = data.replace(/"/g, " ").split('\n');
            var tkrPrices = {};

            for(var i = 0, cnt = data.length; i < cnt; i++) {
                var line = data[i].split(',');
                
                if(line.length > 3) {
                    //console.log(line);
                    var tkr = line[0].trim().replace('-', '.');
                    var price = parseFloat(line[1].trim());
                    var chng = parseFloat(line[2].trim());
                    var perChng = parseFloat(line[3].trim().replace(/[()]/g, ''));
                    
                    tkrPrices[tkr] = { ticker: tkr, price: price, change: chng, percentChange: perChng  };
                }
            }
            
            console.log(tkrPrices);
            self.done(tkrPrices);
        });
        
        return self.promise;
    }
}

TickerService.inherits(BaseService);
module.exports = TickerService;