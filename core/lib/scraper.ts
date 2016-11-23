var Common = require("../utility/Common.js");
var whttp = require("./whttp.js");

import { Database } from './database';

declare var sprintf: any;

export class Scraper {
	static loadPricing(tkr, siDates, callback) {
        var path = "/table.csv?s=%s&%s&%s&g=d&ignore=.csv";
    	var date = new Date();
		var end = sprintf("d=%s&e=%s&f=%s", Common.padMonth(date.getMonth()), Common.padMonth(date.getDate()), date.getFullYear());
		var start = sprintf("a=%s&b=%s&c=%s", '11', '31', '2002');
		path = sprintf(path, tkr.replace('.', '-'), start, end);
		
		whttp.get('ichart.finance.yahoo.com', path, function(data) {
			data = data.split('\n');
            var results = [];   
            var time = (new Date()).getTime();
            
            if(tkr == '^GSPC')
                tkr = 'SP500';

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
                    
                    if((i + 1) == cnt && callback)
                        callback(results);
                }
            });
			
			console.log('scraping tkr prices: ' + tkr);
		});
	}
}