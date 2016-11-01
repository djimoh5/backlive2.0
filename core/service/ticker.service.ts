import { BaseService } from './base.service';

import { Database } from '../lib/database';
import { Session } from '../lib/session';
import { Common } from '../../app//utility/common';

var Scraper = require("../lib/Scraper.js");
var whttp = require("../lib/whttp.js");

export class TickerService extends BaseService {
    protected get pricingDatabase(): any { return Database.mongoPricing };

    constructor(session: Session) {
        super(session);
    }

    getPrices(ticker, years) {
        var today = new Date(),
            query: any = { ticker: ticker };
        
        if(years) {
            query.date = { $gt:(Common.dbDate(today) - (years * 10000)) };
        }
        console.log(query);
    	this.database.collection('market').find(query, {date:1, close:1, adjClose:1, open: 1, high:1, low:1, volume:1, time:1}).sort({date:1}).toArray((err, results) => {
            if(results.length > 0) {
                var date = results[results.length - 1].date;
                var time = results[results.length - 1].time;
                
                if(!Common.isNumber(date))
                    results = [];
            }
            
            if(results.length == 0 || ((time + 3600000) < today.getTime() && date < Common.dbDate(today))) {
                if(query.ticker == 'SP500')
                    query.ticker = '^GSPC'
                        
                //scrape the data
                Scraper.loadPricing(query.ticker, null, (results) => {
                    finish(results);
                });
            }
            else {
                years = null; //doesn't need to be spliced since we already selected the correct timeframe
                finish(results);
            }
            
            var self = this;
            var finish = (results) => {
                if(years) {
                    var days = years * 252;
                    var len = results.length;
                    
                    if(len > days)
                        this.done(results.splice(len - days));
                    else
                        this.done(results);
                }
                else
                    this.done(results);
            }
        });
        
        return this.promise;
	}
    
    getPrice(ticker, date) {
        this.pricingDatabase.collection(ticker.substring(0, 1).toUpperCase()).findOne({ ticker: ticker, date: parseInt(date) }, { adjClose:1 }, (err, result) => {
            if(result)
                this.done({ success:1, price:result.adjClose });
            else
                this.done({ success:0 });
        });
        
        return this.promise;
    }
    
    getLastPrice(ticker) {
        //http://download.finance.yahoo.com/d/quotes.csv?s=^DJI&f=sl1c1p2l1bac8
        if(!ticker) {
            ticker = '^GSPC+^DJX+^IXIC'; //,^TNX for 10 year
        }
         
        whttp.get('download.finance.yahoo.com', '/d/quotes.csv?s=' + ticker + '&f=sl1c1p2bac8', (data) => {
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
            this.done(tkrPrices);
        });
        
        return this.promise;
    }
}