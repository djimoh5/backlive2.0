var jsdom = require("jsdom");
http = require('http');
require('.' + DIR_LIB + "whttp.js");

Scraper = {
	pricing: function() {
		var siDates = [];
	
		db.mysql.query("SELECT fdate FROM file_date WHERE fweek = ? ORDER BY fdate", [1], 
			function(error, results, fields) {
				if(error) {
					console.log("Error selecting data: " + error.message);
					return;
				} else {
					for(var i = 0, cnt = results.length; i < cnt; i++) {
						result = results[i].fdate.toString();
						siDates.push(parseInt(result));
					}
					
					var tkrs = ['SPY', 'VTI', 'IWM', 'GLD', 'VXX', 'VGLT', 'VGSH'];
					
					db.mongo.collection('market', function(error, collection) {
						collection.remove({}, function(err, result) {
							for(var j = 0; j < tkrs.length; j++) {
								Scraper.loadPricing(tkrs[j], siDates);
							}
						});
					});
				}
			}
		)
	},
	
	loadPricing: function(tkr, siDates, callback) {
        var path = "/table.csv?s=%s&%s&%s&g=d&ignore=.csv";
    	var date = new Date();
		var end = u.sprintf("d=%s&e=%s&f=%s", u.padMonth(date.getMonth()), u.padMonth(date.getDate()), date.getFullYear());
		var start = u.sprintf("a=%s&b=%s&c=%s", '11', '31', '2002');
		path = u.sprintf(path, tkr.replace('.', '-'), start, end);
		
		whttp.get('ichart.finance.yahoo.com', path, function(data) {
			data = data.split('\n');
            var results = [];   
            var time = (new Date()).getTime();
            
            if(tkr == '^GSPC')
                tkr = 'SP500';

            db.mongo.collection('market', function(error, collection) {
                collection.remove({ ticker:tkr }, function() {
        			//start at line 1, 0 contains column headings
        			for(var i = 1, cnt = data.length; i < cnt; i++) {
        				var line = data[i].split(',');
        				var date = parseInt(line[0].replace(/-/g, ''));
                        
        				//if(u.inArray(date, siDates)) {
                        if(u.isNumber(date)) {
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
            });
			
			console.log('scraping tkr prices: ' + tkr);
		});
	},
    
    loadShortInterest: function(tkr, index) {
    	whttp.get('www.nasdaq.com', '/symbol/' + tkr + '/short-interest', function(html) {
            console.log(html);
			jsdom.env({ html:html, scripts: ['http://code.jquery.com/jquery-1.7.1.min.js'] }, function (err, window) {
				try {
					var $ = window.jQuery;
					var rowNum = 0;
					
					$('#ShortInterest1_ShortInterestGrid').find('tr').each(function() {
						var fields = ['date','short_intr','volume','days_cover'];
						var cellNum = 0;
						var data = {};
				  
						if(rowNum > 0) {
							$(this).find('td').each(function() {
								data[fields[cellNum]] = $(this).html();
								cellNum++;
							});
							
							var date = data.date.split('/');
							data.date = parseInt(date[2] + u.padMonth(date[0]) + u.padMonth(date[1]));
							
							//set date to next available si date
							var index = 0;
							while(dates[index] && data.date > dates[index]) {
								index++;
							}
							
							if(date[index]) {
								data.date = dates[index];					
								data.short_intr = parseInt(data.short_intr.replace(/,/g,''));
								data.volume = parseInt(data.volume.replace(/,/g,''));
								data.days_cover = parseFloat(data.days_cover.replace(/,/g,''));
								
								//console.log(data);
								db.mongo.collection('shrt_intr', function(error, collection) {
									collection.insert(data);
								});
							}
						}
				  	
						rowNum++;
					});
			  
					console.log("SI loaded for " + tkr + " - " + index);
					//window.close();
					window.__stopAllTimers();
				}
				catch(ex) {
					console.log(ex);
					//window.close();
					window.__stopAllTimers();
				}
			});
		});
	}
}
