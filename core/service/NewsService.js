var BaseService = require("./BaseService.js");
var Common = require("../utility/Common.js");
var urlParser = require("url");
var whttp = require("../lib/whttp.js");

function NewsService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
        
    this.getCustomFeed = function(rss) {
        var parse = urlParser.parse(rss);
        if(parse.hostname && parse.pathname) {
            whttp.get(parse.hostname, parse.pathname, function(data) {
                self.done(data);
            });
        }
        else
            self.done('');
    }
    
    this.getCompanyNews = function(ticker) {
	    var path = 'headline?s=' + ticker + '&';
	    console.log('feeds.finance.yahoo.com', '/rss/2.0/' + path + 'region=US&lang=en-US');
        db.mongo.collection('tickers_ac').findOne({ t: ticker.replace('-', '.') }, { t:1 }, function(err, tkr) {
            if(tkr != null) {
                whttp.get('feeds.finance.yahoo.com', '/rss/2.0/' + path + 'region=US&lang=en-US', function(data) {
                    self.done(data);
                });
            }
            else
                self.done([]);
        });
        
        return self.promise;
    }
    
    this.getMarketNews = function() {
        var ft = [];
        
        whttp.get('feeds.finance.yahoo.com', '/rss/2.0/category-stocks?region=US&lang=en-US', function(data) {
            ft.push(data);
            whttp.get('feeds.finance.yahoo.com', '/rss/2.0/category-economy-govt-and-policy?region=US&lang=en-US', function(data) {			
                ft.push(data)
                self.done(ft);
            });
        });
        
        return self.promise;
    }

    this.getCNBCNews = function() {
        whttp.get('www.cnbc.com', '/id/100003241/device/rss/rss.html', function(data) {
            self.done(data);
        });
        
        return self.promise;
    }
	
    this.getBloombergRadio = function() {
        whttp.get('www.bloomberg.com', '/tvradio/podcast/cat_markets.xml', function(data) {
            self.done(data);
        });
        
        return self.promise;
    }
    
    this.getEconomist = function() {
        var econ = [];		
        whttp.get('www.economist.com', '/feeds/print-sections/79/finance-and-economics.xml', function(data) {
            econ.push(data);			
            whttp.get('www.economist.com', '/feeds/print-sections/77/business.xml', function(data) {
                econ.push(data);
                self.done(econ);
            });
        });
        
        return self.promise;
    }
}

NewsService.inherits(BaseService);
module.exports = NewsService;