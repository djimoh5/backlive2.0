import { Http } from './http';
import { Common } from '../../ui/src/app/utility/common';
import { Database } from './database';

export class Scraper {
	static loadPricing(tkr, siDates, callback) {
    	var date = new Date();
		var end = `d=${Common.padDatePart(date.getMonth())}&e=${Common.padDatePart(date.getDate())}&f=${date.getFullYear()}`;
		var start = `a=${'11'}&b=${'31'}&c=${'2002'}`;
		var path = `/table.csv?s=${tkr.replace('.', '-')}&${start}&${end}&g=d&ignore=.csv`;
		
		new Http().get('ichart.finance.yahoo.com', path, function(data) {
			data = data.split('\n');
            var results = [];   
            var time = (new Date()).getTime();
            
            if(tkr == '^GSPC') {
                tkr = 'SP500';
            }

            var collection = Database.mongo.collection('market');
            collection.remove({ ticker:tkr }, function() {
                //start at line 1, 0 contains column headings
                for(var i = 1, cnt = data.length; i < cnt; i++) {
                    var line = data[i].split(',');
                    var date = parseInt(line[0].replace(/-/g, ''));
                    
                    //if(Common.inArray(date, siDates)) {
                    if(Common.isNumber(date)) {
                        var open = parseFloat(line[1]);
                        var high = parseFloat(line[2]);
                        var low = parseFloat(line[3]);
                        var close = parseFloat(line[4]);
                        var volume = parseInt(line[5]);
                        var adjClose = parseFloat(line[6]);
                        
                        collection.insert({ date:date, ticker:tkr, open:open, high:high, low:low, close:close, volume:volume, adjClose:adjClose, time:time });
    
                        results.unshift({ date:date, close:close, adjClose:adjClose, high:high, low:low, volume:volume });
                    }
                    
                    if((i + 1) == cnt && callback) {
                        callback(results);
                    }
                }
            });
			
			console.log('scraping tkr prices: ' + tkr);
		});
	}
}