var jsdom = require("jsdom");
var fs = require('fs')
http = require('http');
https = require('https');
require('.' + DIR_LIB + "whttp.js");
var mongoShrt, mongoDiv;

Parser = {
    eurodollar: function() {
        fs.readFile("./data/ed_hist.csv", 'utf8', function(err, txt) {
    	    db.mongo.collection('eurodo', function(error, collection) {
                collection.remove({}, function(err, result) {
                    var data = txt.split('\r\n');
                    var dates = {};
                    
                    var cntrs = data[0].split(','); //contracts in heading
                    //console.log(cntrs);

                    for(var i = 2, ilen = data.length; i < ilen; i++) { //price start at index 2
                        var prices = data[i].split(',');
                        //console.log(prices);
                        
                        for(var j = 0, jlen = cntrs.length; j < jlen; j++) {
                            var cntr = cntrs[j].trim();
                            if(cntr.length > 0) {
                                if(prices[j] && prices[j].length > 0) {
                                    var date = Parser.getDate(prices[j], 1);
                                    
                                    if(!dates[date])
                                        dates[date] = { date:date, ticker:0 };
                                    
                                    cntr = cntr.split(' ');
                                    dates[date][cntr[0]] = parseFloat(prices[j + 1]);
                                }
                                
                                j += 2;
                            }
                        }
                    }
                    
                    for(var date in dates) {
                        //console.log(dates[date]);
                        collection.insert(dates[date], function() {});
                    }
                    
                    Parser.exit();
                });
    	    });
        });
	},
    
    eurodollarRollDate: function() {
        fs.readFile("./data/ed_roll_date.csv", 'utf8', function(err, txt) {
            db.mongo.collection('roll_date', function(error, collection) {
                collection.remove({}, function(err, result) {
                    var data = txt.split('\r\n');
                    var dates = {};
                    
                    for(var i = 1, ilen = data.length; i < ilen; i++) {
                        var date = data[i].split(',');
                        console.log(date);
                        
                        date = Parser.getDate(date[0], 2);
                        collection.insert({ date:date, type:'ed' }, function() {});
                    }
                    
                    Parser.exit();
                });
    	    });
        });
	},
    
	gdp: function() {
        fs.readFile("./data/" + file, 'utf8', function(err, txt) {
		    Parser.parse(txt, { collection:'macro', dateFormat:99, dataFormat:'csv', fields:[{ name:'gdp', type:'f' }] });
        });
	},
    
    rates: function() {
        whttp.get('www.federalreserve.gov', '/datadownload/Output.aspx?rel=H15&series=ae65f61307b113867bff28a94e22f5f4&lastObs=&from=01/01/2000&to=12/31/2013&filetype=csv&label=include&layout=seriescolumn', function(data) {
            Parser.parse(data, { collection:'rates', start:7, dateFormat:2, dataFormat:'csv', fields:[{ name:'trs_3m' }, { name:'trs_1yr' }, { name:'trs_2yr' }, { name:'trs_10yr' }, { name:'trsi_10yr' }, 
                                        { name:'trs_30yr' }, { name:'trsi_30yr' }, { name:'erd_3m' }, { name:'trs_5yr' }, { name:'trsi_5yr' }, { name:'mood_aaa' }, { name:'mood_baa' }, { name:'mortg_30y' } ] });
        });
    },
    
    stlfed: function() {
        var series = [['WGS3MO', 'w'], ['WGS1YR', 'w'], ['WGS2YR', 'w'], ['WGS5YR', 'w'], ['WFII5', 'w'], ['WGS10YR', 'w'], ['WFII10', 'w'], ['WGS30YR', 'w'], ['WFII30', 'w'], ['MORTGAGE30US', 'w'], ['USD3MTD156N', 'w'],
                        ['GDP'], ['CBI'], ['WAAA', 'w'], ['WBAA', 'w'], ['BAMLH0A0HYM2EY', 'w'], ['BAMLC0A4CBBBEY', 'w'], ['BAMLH0A3HYCEY', 'w'], ['BAMLC0A1CAAAEY', 'w'],
                        ['UNRATE'], ['PAYEMS'], ['CIVPART'], ['UMCSENT'], ['STLFSI'], ['ANFCI'], ['DCOILWTICO', 'w'], ['DCOILBRENTEU', 'w'], ['GASPRICE'], ['SPCS20RSA'], ['TWEXM', 'w'], ['USREC'], ['USSLIND'],
                        ['NAPM'], ['NAPMNOI'], ['NMFBAI'], ['NMFCI'], ['NAPMII'], ['NAPMEXI'], ['NAPMEI'], ['RSAFS'], ['RRSFS'], ['RSXFS'], ['ALTSALES'], ['UMTMTI'], ['AMTMNO'], ['CPIAUCSL'], ['PPIACO']];
        
        //var series = [['DCOILWTICO', 'w'], ['DCOILBRENTEU', 'w']];
        
        for(var i = 0, cnt = series.length; i < cnt; i++) {
            if(series[i].length == 1)
                Parser.stlfedHelper(series[i][0]);
            else
                Parser.stlfedHelper(series[i][0], series[i][1]);
        }
        //http://api.stlouisfed.org/fred/series/observations?series_id=IC4WSA&observation_start=2000-01-01&frequency=m&aggregation_method=eop&output_type=4&api_key=5436daca99e8dbcae0f63c79e5cc5bc3
        //realtime_end=2000-01-01&
        
        //indicators to pull
        //Money Supply - WRESBAL, BASE, M1, M2, M1V, M2V
        //Currency - TWEXM
        //Credit - TOTALSL, REVOLSL, NONREVSL, BUSLOANS, DALLCACBEP, DRALACBN, DRBLACBS, DRSFRMACBS
        //Rates - AAA, BAA, BAMLH0A0HYM2EY, BAMLC0A4CBBBEY, BAMLH0A3HYCEY, BAMLC0A1CAAAEY
        //Prices - SPCS20RSA
        //Financial Indexes - UMCSENT, STLFSI, ANFCI
        //Product Accounts - GDP, CBI
    },
    
    stlfedHelper: function(field, freq) {
        var params = freq ? field + '&frequency=' + freq : field; 
        //console.log('/fred/series/observations?series_id=' + params + '&observation_start=1990-01-01&output_type=1&api_key=5436daca99e8dbcae0f63c79e5cc5bc3');
        var rates = ['UNRATE', 'CIVPART', 'WGS3MO', 'WGS1YR', 'WGS2YR', 'WGS5YR', 'WFII5', 'WGS10YR', 'WFII10', 'WGS30YR', 'WFII30', 'MORTGAGE30US', 'USD3MTD156N', 'BAMLC0A1CAAAEY', 'BAMLC0A4CBBBEY', 'BAMLH0A0HYM2EY', 'BAMLH0A3HYCEY', 'CPI', 'PPI', 'WAAA', 'WBAA'];

        whttp.get('api.stlouisfed.org', '/fred/series/observations?series_id=' + params + '&observation_start=1990-01-01&output_type=1&api_key=5436daca99e8dbcae0f63c79e5cc5bc3', function(xml) {
            //console.log(xml);
            var doc = jsdom.jsdom(xml);
            var nodes = doc.getElementsByTagName('observation');
            var data = [];
            
            for (var j = 0, cnt = nodes.length; j < cnt; j++) {
                data.push([nodes[j].getAttribute("date"), nodes[j].getAttribute("value")]);
                //console.log(nodes[j].getAttribute("date") + ' - ' + nodes[j].getAttribute("value"));
            }
            
            if(data.length > 0) {
                console.log('loading data for ' + field);
                Parser.parse(data, { collection:'macro', dateFormat:2, fields:[{ name:'val' }] }, field, null, true);
            }
            else
                console.log('No data retrieved for ' + field);
        }, null, null, true);
    },
    
    shortInterest: function() {
    	Parser.getTickers(function(tickers) {
            Parser.shortTickers = tickers;
			console.log("Loading short interest for " + tickers.length + " tickers");
            
            var mongoDB = require('mongodb');
            mongoShrt = new mongoDB.Db('shrtintr', new mongoDB.Server('localhost', 27017, {}), { w:0 });
            mongoShrt.open(function(error) { 
        		if(error)
	    			console.log('Mongo Connection Error: ' + error);
	    		else
	    			Parser.nextShortInterest();
	    	});
		});
	},
    
    nextShortInterest: function() {
        if(Parser.shortTickers.length > 0) {
            var tkr = Parser.shortTickers.shift();
            
            mongoShrt.collection('raw', function(error, collection) {     
                var data = [];
                
                collection.find({ ticker:tkr }).sort({ date:1 }).toArray(function(err, results) {
                    if(!err && results.length > 0) {
                        console.log('loading short interest for ticker ' + tkr);
                        
                        for(var j = 0, cnt2 = results.length; j < cnt2; j++) {
                            var result = results[j];
                            data.push([result.date, result.shrt_intr.toString(), result.vol.toString(), result.days_cv.toString()]); 
                        }       
                        
                        Parser.parse(data, { collection:'shrt_intr', dateFormat:0, fields:[{ name:'shrt_intr' }, { name:'vol', type:'i' }, { name:'days_cv' }] }, tkr, Parser.nextShortInterest);
                    }
                    else {
                        console.log('unable to load short interest for ticker ' + tkr);
                        Parser.nextShortInterest();
                    }
                });
            });
        }
        else
            Parser.exit();
    },
    
    dividends: function() {
    	Parser.getTickers(function(tickers) {
            Parser.dividends = tickers;
			console.log("Loading dividends for " + tickers.length + " tickers");
            
            var mongoDB = require('mongodb');
            mongoDiv = new mongoDB.Db('dividend', new mongoDB.Server('localhost', 27017, {}), { w:0 });
            mongoDiv.open(function(error) { 
        		if(error)
	    			console.log('Mongo Connection Error: ' + error);
	    		else
	    			Parser.nextDividends();
	    	});
		});
	},
    
    nextDividends: function() {
        if(Parser.dividends.length > 0) {
            var tkr = Parser.dividends.shift();
            
            mongoDiv.collection('raw', function(error, collection) {     
                var data = [];
                
                collection.find({ ticker:tkr }).sort({ date:1 }).toArray(function(err, results) {
                    if(!err && results.length > 0) {
                        console.log('loading dividends for ticker ' + tkr);
                        
                        for(var j = 0, cnt2 = results.length; j < cnt2; j++) {
                            var result = results[j];
                            data.push([result.date, result.amt.toString(), result.type.toString()]); 
                        }       
                        
                        Parser.parse(data, { collection:'dividend', dateFormat:0, fields:[{ name:'amt' }, { name:'type', type:'s' }]}, tkr, Parser.nextDividends);
                    }
                    else {
                        console.log('no dividend data for ' + tkr);
                        Parser.nextDividends();
                    }
                });
            });
        }
        else
            Parser.exit();
    },
	
	parse: function(data, config, tkr, callback, append) {
		//db.mysql.query("SELECT fdate FROM file_date WHERE fweek = ? ORDER BY fdate", [1], function(error, results) {
        u.getDates(function(dates) {
    	    var dateIndex = 0;
            var numDates = dates.length;
            var txt = config.dataFormat == 'csv' ? data.split('\n') : data;
            
			db.mongo.collection(config.collection, function(error, collection) {
                var removeQuery = tkr ? { ticker:tkr } : {};
                
                collection.remove(removeQuery, function(err, result) {
					var line, prevObj;
					  							
                    for(var i = config.start ? (config.start - 1) : 0, cnt = txt.length; i < cnt; i++) {
                        //console.log(txt[i]);
                        if(txt[i].length > 0) {
                            line = config.dataFormat == 'csv' ? txt[i].split(',') : txt[i];
							var adate = Parser.getDate(line[0], config.dateFormat);
							var obj = { ticker: tkr ? tkr : '0' };
							var sdate;
                            
                            //set date to match closest backtest rebalance date
                            if(adate > 20021201 && dateIndex < numDates) {
                                if(adate > dates[dateIndex]) {
    								while(adate > dates[dateIndex] && dateIndex < numDates) {									
										sdate = dates[dateIndex];
                                        
                                        if(prevObj) {
    										prevObj.date = sdate;
                                            delete prevObj._id;
                                            
                                            //console.log(prevObj);
    										
                                            if(append)
                                                collection.update({ date:prevObj.date }, { $set:prevObj }, { upsert:true }, function() {});
                                            else
                    							collection.insert(prevObj, function(err) {});
                                        }
                                        
										dateIndex++;
									}
                                }
                                
                                //make sure there's no closer date to map too
                                var nextDate = adate;
                                while(dates[dateIndex] > nextDate && i + 1 < cnt) {
                                    var nextLine = config.dataFormat == 'csv' ? txt[i + 1].split(',') : txt[i + 1];
						            nextDate = Parser.getDate(nextLine[0], config.dateFormat);   
                                    
                                    if(nextDate <= dates[dateIndex]) {
                                        //there's another line closer in date so move to it
                                        line = nextLine;
                                        adate = nextDate;
                                        i++;
                                    }
                                }

								sdate = dates[dateIndex];
								dateIndex++;
							}
							else
								sdate = adate;
							
							for(var j = 1, numVals = line.length; j < numVals; j++) {
                                var jc = j - 1;
                                
                                if(config.fields[jc] && (config.fields[jc].type == 's' || ((line[j] = line[j].replace(/,/g,'')) && u.isNumber(line[j])))) {
									switch(config.fields[jc].type) {
										case 'f': obj[config.fields[jc].name] = parseFloat(line[j]);
											break;
										case 'i': obj[config.fields[jc].name] = parseInt(line[j]);
											break;
                                        case 's': obj[config.fields[jc].name] = line[j];
											break;
										default: obj[config.fields[jc].name] = parseFloat(line[j]);
											break;
									}
                                }
                                else if(prevObj && prevObj[tkr]) {
                                    obj[config.fields[jc].name] = prevObj[tkr];
                                }
                                else
                                    obj[config.fields[jc].name] = u.NO_VALUE;
							}
							
                            //console.log(adate + ' - ' + sdate);
                            if(append) {
                                var val = obj[config.fields[0].name];
                                obj = { ticker:0 };
                                obj[tkr] = val;
                                obj['dt_' + tkr] = adate;
                            }
                            else
							    obj.adate = adate;
							
                            obj.date = sdate;
							prevObj = obj;
                            
                            //console.log(prevObj);

                            if(append)
                                collection.update({ date:sdate }, { $set:obj }, { upsert:true }, function() {});
                            else
								collection.insert(obj, function(err) {});
                        }
					}
                    
                    //add last value to all remaining dates
                    while(dateIndex < numDates) {
                        prevObj.date = dates[dateIndex++];
                        delete prevObj._id;
                        
                        //console.log(prevObj);
                        
                        if(append)
                            collection.update({ date:prevObj.date }, { $set:prevObj }, { upsert:true }, function() {});
                        else
							collection.insert(prevObj, function(err) {});
                    }
                    
                    if(callback)
                        callback();
                });
			});
    	}, -1);
	},
	
	getDate: function(date, format) {
		switch(format) {
			case 99: 
				var qtr = parseInt(date.substring(7, 8));
				qtr = qtr == 4 ? 1 : qtr * 3 + 1;
				var yr = parseInt(date.substring(1, 5));
				
				if(qtr == 1)
					yr++;
				
				return parseInt(yr + '' + u.padMonth(qtr) + '30');
				break;
            case 0:
                return date;
                break;
            case 1:
                var date = date.split('/');
    			return parseInt(date[2] + u.padMonth(date[0]) + u.padMonth(date[1]));
                break;
            case 2:
                return parseInt(date.replace(/-/g, ''));  
                break;
		}
	},

	getTickers: function(callback) {
        u.getDates(function(dates) {
            var maxDate = dates[dates.length - 1];
            
    		db.mongo.collection('tickers', function(error, collection) {
    			collection.find({"date":maxDate}).toArray(function(err, results) {    
    				if(err) {
    					console.log('Mongo Exception: ' + err.message);
    				}
    				else {
    					var tickers = [];
    					
    					for(var i = 0, cnt = results.length; i < cnt; i++) {
    						var result = results[i];
							
							if(result.ticker != null && result.price != null && result.mktcap != null)
								tickers.push(result.ticker);
						}
						
						db.mongo.collection('etf', function(error, collection) {
                            collection.find().toArray(function(err, results) {
                                if(err) {
    					            console.log('Mongo Exception: ' + err.message);
    				            }
    				            else {
                                    for(var i = 0, cnt = results.length; i < cnt; i++) {
                                        tickers.push(results[i].ticker);
                                    }
    				            }
                            });
                        });
						
						callback(tickers);
    				}
    			});
    		});
        }, -1);
	},
    
    exit: function() {
        setTimeout(function() {
            process.exit();
        }, 2000);
    }
}