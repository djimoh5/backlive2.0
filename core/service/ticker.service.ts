import { BaseService } from './base.service';
import { TickercRepository } from '../repository/tickerc.repository';

import { Database } from '../lib/database';
import { ISession } from '../lib/session';
import { Common } from '../../app//utility/common';
import { Scraper } from '../lib/scraper';

import { Tickerc } from '../service/model/ticker.model';

var whttp = require("../lib/whttp.js");

export class TickerService extends BaseService {
    protected get pricingDatabase(): any { return Database.mongoPricing; };

    tickercRepository: TickercRepository;

    constructor(session: ISession) {
        super(session, { tickercRepository: TickercRepository });
    }

    getTickers(date: number) : Promise<Tickerc[]> {
        this.tickercRepository.getByDate(date).then(tickerCache => {
            this.done(tickerCache.data);
        });

        return this.promise;
    }

    getPrices(ticker, years) {
        var today = new Date(),
            query: any = { ticker: ticker };
        
        if(years) {
            query.date = { $gt:(Common.dbDate(today) - (years * 10000)) };
        }
        
    	this.database.collection('market').find(query, {date:1, close:1, adjClose:1, open: 1, high:1, low:1, volume:1, time:1}).sort({date:1}).toArray((err, results) => {
            if(results.length > 0) {
                var date = results[results.length - 1].date;
                var time = results[results.length - 1].time;
                
                if(!Common.isNumber(date)) {
                    results = [];
                }
            }
            
            if(results.length == 0 || ((time + 3600000) < today.getTime() && date < Common.dbDate(today))) {
                if(query.ticker == 'SP500') {
                    query.ticker = '^GSPC';
                }
                        
                //scrape the data
                Scraper.loadPricing(query.ticker, null, (results) => {
                    this.finish(results, years);
                });
            }
            else {
                years = null; //doesn't need to be spliced since we already selected the correct timeframe
                this.finish(results, years);
            }
        });
        
        return this.promise;
	}

    private finish(results, years) {
        if(years) {
            var days = years * 252;
            var len = results.length;
            
            if(len > days) {
                this.done(results.splice(len - days));
            }
            else {
                this.done(results);
            }
        }
        else {
            this.done(results);
        }
    }
    
    getPrice(ticker, date) {
        this.pricingDatabase.collection(ticker.substring(0, 1).toUpperCase()).findOne({ ticker: ticker, date: parseInt(date) }, { adjClose:1 }, (err, result) => {
            if(result) {
                this.done({ success:1, price:result.adjClose });
            }
            else {
                this.done({ success:0 });
            }
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
                    var tkr = line[0].trim().replace('-', '.');
                    var price = parseFloat(line[1].trim());
                    var chng = parseFloat(line[2].trim());
                    var perChng = parseFloat(line[3].trim().replace(/[()]/g, ''));
                    
                    tkrPrices[tkr] = { ticker: tkr, price: price, change: chng, percentChange: perChng  };
                }
            }
            
            this.done(tkrPrices);
        });
        
        return this.promise;
    }
}