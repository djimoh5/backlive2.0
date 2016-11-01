import { BaseService } from './base.service';
import { Session } from '../lib/session';
import { Common } from '../../app//utility/common';

var urlParser = require("url");
var whttp = require("../lib/whttp.js");

export class NewsService extends BaseService {
    constructor(session: Session) {
        super(session);
    }

    getCustomFeed(rss) {
        var parse = urlParser.parse(rss);
        if(parse.hostname && parse.pathname) {
            whttp.get(parse.hostname, parse.pathname, (data) => {
                this.done(data);
            });
        }
        else
            this.done('');
    }
    
    getCompanyNews(ticker) {
	    var path = 'headline?s=' + ticker + '&';
	    console.log('feeds.finance.yahoo.com', '/rss/2.0/' + path + 'region=US&lang=en-US');
       this.database.collection('tickers_ac').findOne({ t: ticker.replace('-', '.') }, { t:1 }, (err, tkr) => {
            if(tkr != null) {
                whttp.get('feeds.finance.yahoo.com', '/rss/2.0/' + path + 'region=US&lang=en-US', (data) => {
                    this.done(data);
                });
            }
            else
                this.done([]);
        });
        
        return this.promise;
    }
    
    getMarketNews() {
        var ft = [];
        
        whttp.get('feeds.finance.yahoo.com', '/rss/2.0/category-stocks?region=US&lang=en-US', (data) => {
            ft.push(data);
            whttp.get('feeds.finance.yahoo.com', '/rss/2.0/category-economy-govt-and-policy?region=US&lang=en-US', (data) =>{			
                ft.push(data)
                this.done(ft);
            });
        });
        
        return this.promise;
    }

    getCNBCNews() {
        whttp.get('www.cnbc.com', '/id/100003241/device/rss/rss.html', (data) => {
            this.done(data);
        });
        
        return this.promise;
    }
	
    getBloombergRadio() {
        whttp.get('www.bloomberg.com', '/tvradio/podcast/cat_markets.xml', (data) => {
            this.done(data);
        });
        
        return this.promise;
    }
    
    getEconomist() {
        var econ = [];		
        whttp.get('www.economist.com', '/feeds/print-sections/79/finance-and-economics.xml', (data) => {
            econ.push(data);			
            whttp.get('www.economist.com', '/feeds/print-sections/77/business.xml', (data) => {
                econ.push(data);
                this.done(econ);
            });
        });
        
        return this.promise;
    }
}