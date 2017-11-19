require("./fieldmap.min.js");

Calculation = function() {
	var Operator = { Add:0, Subtract:1, Multiply:2, Divide:3 }
	var ParamType = { Value:0, IncomeStatement:1, BalanceSheet:2, CashFlowStatement:3, Statistic:4, Proprietary:5, Technicals:6, Macro:7, ShortInterest:8, 'Growth IncomeStatement':9, FinancialStatement:10, FinancialIndicators:11, Funds:99, 'Constant':-1 }
	
	var values = null;
	var tables = { 
		0:"", 1:"is", 2:"bs", 3:"cf", 4:"snt", 5:"mos", 6:"tech", 7:"macro", 8:"shrt_intr", 9:"is_gr", 10:"fs", 11:"fi",
		100:"_team", 101:"_player", 102:"_bet"
	};
	var tableConfig = {
		101:{ mult:'player' }
	}
	
    var nonTickerTypes = [ParamType.Macro];
    
	var ops;
	var params;
	var name;
	var signed;
	var doNotCalc;
	var indicator;
	var numParams;
	var fields;
	var cacheOptions;
	var allCacheKeys = {}; //need all possible keys in query so constant values can be mapped to them
    
    var USE_DENORM_TBL = true;
    var DENORM_PARAM_TYPES = [ParamType.IncomeStatement, ParamType.BalanceSheet, ParamType.CashFlowStatement, ParamType.Statistic];
	
	this.cache = function(indicators, date, callback, ticker, inclTypes, options) {
		if(date && !u.isArray(date))
            date = parseInt(date);
       
        if(inclTypes) { //use daily table
            for(var i = 0, len = inclTypes.length; i < len; i++) {
                tables[inclTypes[i]] += '_d'; 
            }
        }
       
		var len = indicators.length;
		fields = {};
		cacheOptions = options ? options : {};
		
		if(cacheOptions.tablePrefix) {
            for(var t in tables) {
                tables[t] = cacheOptions.tablePrefix + tables[t]; 
            }
        }
		
		for(var i = 0; i < len; i++) {
			setFields(indicators[i]);			
		}
		
		var cnt = 0;
		
		for(type in fields) {
			cnt++;
		}
		
		var cache = {};
		var cls = this;
	    //console.log(fields);
		
		if(cnt == 0)
			callback(cache, allCacheKeys);
		else {
			for(type in fields) {
			    if(!inclTypes || u.inArray(parseInt(type), inclTypes)) {
    				callDB(date, fields[type], type, function(vals, cacheType) {
                        if(ticker && date && u.inArray(parseInt(cacheType), nonTickerTypes)) {
                            //set key for ticker to value so that equations can be calculated
                            var tmpVals = { 0:vals[0] };
                            var tkrs = toString.call(ticker) === "[object Array]" ? ticker : [ticker];
                            
                            for(var t = 0, tlen = tkrs.length; t < tlen; t++) {
                                for(var key in vals) {
                					tmpVals[tkrs[t]] = vals[key];
            					}
                            }
                            
                            cache[cacheType] = tmpVals;
                        }
                        else
                            cache[cacheType] = vals;
    	
    					if(--cnt == 0)
    						callback(cache, allCacheKeys);
    				}, !ticker || u.inArray(parseInt(type), nonTickerTypes) ? null : ticker);
			    }
			    else {
			        cache[type] = {};
			        
			        if(--cnt == 0)
			            callback(cache, allCacheKeys);
			    }
			}
		}
	}
	
	function setFields(eq) {
    	for(var i = 0, cnt = eq.vars.length; i < cnt; i++) {
			var obj = eq.vars[i];
			
			if(obj) {
				if(obj.length > 0) {
					var type = parseInt(obj[0]);
					var field = obj[1];
					
					if(type != ParamType.Constant) { // && (type != ParamType.Statistic || field != "price")) {
                        var map = RFIELD_MAP[type] ? RFIELD_MAP[type][field] : null;

                        if(USE_DENORM_TBL && u.inArray(type, DENORM_PARAM_TYPES)) {
                            map = tables[type] + '_' + (map ? map : field);
                            type = ParamType.FinancialStatement;
                        }
                        
						if(!fields[type])
							fields[type] = {};
						
                        if(map)
						    fields[type][map] = 1;
                        else
                            fields[type][field] = 1;
					}
				}
				else
					setFields(obj);
			}
		}
	}
	
	this.init = function(eq, allowNeg, noCalc) {
    	indicator = eq;
		params = [];
		
		for(var i = 0, cnt = eq.vars.length; i < cnt; i++) {
			var obj = eq.vars[i];
			
			if(!obj) {
				params.push(null);
			}
			else if(obj.length > 0) {
				var type = obj[0];
				var field = obj[1];
                var fn = obj[2];
                
                if(type == ParamType.Constant) {
                    params.push([ type, field ]);
                }
                else {
                    var map = RFIELD_MAP[type] ? RFIELD_MAP[type][field] : null;

                    if(USE_DENORM_TBL && u.inArray(type, DENORM_PARAM_TYPES)) {
                        map = tables[type] + '_' + (map ? map : field);
                        type = ParamType.FinancialStatement;
                    }
                    
                    if(map)
                        field = map;
                        
    				params.push([ type, field, fn ]);
                }
			}
			else {
				var calc = new Calculation();
				calc.init(obj, allowNeg);
				params.push(calc);
			}
		}
		
		numParams = params.length;
		
		ops = eq.ops;
		signed = allowNeg ? true : false;
		doNotCalc = noCalc;
		name = null;
		values = {};
		
		return this;
	}

	this.calculate = function(date, cache, subEq, ticker) { //ticker set for market S&P500 when calculating exposure
		var vals = [];
		var fields = [];
        var fns = [];
        
        if(date) date = parseInt(date);

		for(var i = 0; i < numParams; i++) {
			if(params[i] != null) {
				if(params[i].length >= 2) {
					var type = params[i][0];
					var field = params[i][1];
                    var fn = params[i][2];
					
                    if(type == ParamType.Constant) {
                        //set each ticker to the constant val
                        var cVals = { 0:field }; //ticker 0 is for macro, eurodollar etc
                        
                        if(!ticker) {
                            if(values['allCacheKeys']) {
                                for(var key in values['allCacheKeys']) { //just loop to reference each ticker
                                    cVals[key] = field;
                                }
                            }
                        }
                        
                        vals.push(cVals);
                        fields.push(null);
                    }
                    else {
                        if(date) {
                            if(cache[type][date])
    					        vals.push(ticker ? { 0:cache[type][date][ticker] } : cache[type][date]);
    					    else
    					        vals.push({});
                        }
    					else
    					    vals.push(ticker ? { 0:cache[type][ticker] } : cache[type]);
    					    
    					fields.push(field);
                    }
                    
                    fns.push(fn);
				}
				else {
					//pass explicitly set values along
					params[i].setValues(values);
					vals.push(params[i].calculate(date, cache, true, ticker));
					fields.push(null);
					fns.push(null);
				}
			}
		}
		
		var finalVals = {};
		var errors = 0;
		var cnt = 0;
        
		for(var key in vals[0]) {
			var val = fields[0] != null ? vals[0][key][fields[0]] : vals[0][key];
	
	        if(doNotCalc) {
	            finalVals[key] = val;
	            continue;
	        }
			else if(!u.isNumber(val) || val == NO_VALUE) {
				errors++;
				val = NO_VALUE;
			}
			else {
                if(fns[0] && fns[0] == 1)
                    val = Math.abs(val);
                    
				for(var i = 1, len = vals.length; i < len; i++) {
					var tmpVal = fields[i] != null ? (vals[i][key] ? vals[i][key][fields[i]] : null) : vals[i][key];
					
					if(!u.isNumber(tmpVal) || tmpVal == NO_VALUE || val == NO_VALUE) {
						errors++;
						val = NO_VALUE;
						break;
					}
					else {
						var op = ops[i - 1];
                        
                        if(fns[i] && fns[i] == 1)
                            tmpVal = Math.abs(tmpVal);

						switch(op) {
							case Operator.Add: val += tmpVal; break;
							case Operator.Subtract: val -= tmpVal; break;
							case Operator.Multiply:
                                //exclude multiplication of two negative numbers
                                val = (val < 0 && tmpVal < 0) ? NO_VALUE : val * tmpVal;
                                break;
							case Operator.Divide:
                                //exclude division of two negative numbers
                                val = (val < 0 && tmpVal < 0) ? NO_VALUE : val / tmpVal;
                                break;
							default: val = NO_VALUE; break;
						}
						
						if(!u.isNumber(val) || val == NO_VALUE) {
							errors++;
							val = NO_VALUE;
							break;
						}
						
						cnt++;
					}    
				}
			}
			
            if(!subEq && !signed && val < 0)
                val = NO_VALUE;
            
            if(val != NO_VALUE)
			    finalVals[key] = val;
		}
		
		return finalVals;
	}
	
	this.groupCache = function(cache, tickers, grpBy) {
	    var newCache = {};
	    
	    for(var type in cache) {
	        newCache[type] = {};
	        
	        for(var tkr in cache[type]) {
	            if(!tickers[tkr])
	                console.log(cache[type][tkr]);
	            var grpVal = tickers[tkr][grpBy];
	            
	            if(!newCache[type][grpVal])
	                newCache[type][grpVal] = { ticker:grpVal };
	           
	            for(var field in cache[type][tkr]) {
	                if(field != 'ticker' && field != '_id') {
	                    if(!newCache[type][grpVal][field])
	                        newCache[type][grpVal][field] = 0;
	                
	                    var val = cache[type][tkr][field];
	                    newCache[type][grpVal][field] +=  val != NO_VALUE && u.isNumber(val) ? val : 0;
	                }
	            }
	        }
	    }
	    
	    //console.log(newCache);
	    return newCache;
	}
	
    this.aggregate = function(resultCache, selector, ptype, index, currVals) {
        var end = resultCache.length - Math.abs(indicator.aggrSpan);

        if(resultCache[end][selector][ptype][index]) {             
            switch(indicator.aggrType) {
                case 'past': return pastValue(resultCache, selector, ptype, index);
                case 'avg': return avg(resultCache, selector, ptype, index);
                case 'ravg': return relativeAvg(resultCache, selector, ptype, index, currVals); //current value relative to average
                case 'cagr': return cagr(resultCache, selector, ptype, index);
                case 'sum': return sum(resultCache, selector, ptype, index);
                case 'geo': return geometricAvg(resultCache, selector, ptype, index);
                case 'chng': return percentChange(resultCache, selector, ptype, index);
            }
        }
        else {
            console.log('not enough data to calculate aggregate time span ', indicator.aggrSpan);
            return {};
        }
    }
    
    function pastValue(resultCache, selector, ptype, index) {
        return resultCache[resultCache.length - Math.abs(indicator.aggrSpan)][selector][ptype][index];
    }
    
    function avg(resultCache, selector, ptype, index) {
        return sum(resultCache, selector, ptype, index, true);
    }
    
    function relativeAvg(resultCache, selector, ptype, index, currVals) {
        var data = sum(resultCache, selector, ptype, index, true);
        
        for(var tkr in data) {
            if(u.defined(currVals[tkr]) && data[tkr] > 0)
                data[tkr] = currVals[tkr] / data[tkr];
            else
                delete data[tkr];
        }
        
        return data;
    }
    
    function sum(resultCache, selector, ptype, index, retAvg) {
        var start = resultCache.length - 1;
        var end = start - Math.abs(indicator.aggrSpan) + 1;
        var data = {}, val, cache;   
        retAvg = retAvg ? Math.abs(indicator.aggrSpan) : 1; //allows you to calculate avg instead of sum
        
        cache = resultCache[start--][selector][ptype][index];
        for(var tkr in cache)
            data[tkr] = cache[tkr] / retAvg;
        
        while(start >= end) {
            cache = resultCache[start--][selector][ptype][index];
            
            for(var tkr in data) {
                val = cache[tkr];
                if(u.defined(val))
                    data[tkr] += val / retAvg;
                else
                    delete data[tkr]; //must have value for all years
            }
        }
    
        return data;
    }
    
    function geometricAvg(resultCache, selector, ptype, index) {
        var start = resultCache.length - 1;
        var end = start - Math.abs(indicator.aggrSpan) + 1;
        var data = {}, val, cache;
        
        cache = resultCache[start--][selector][ptype][index];
        for(var tkr in cache)
            data[tkr] = 1 + cache[tkr];
        
        while(start >= end) {
            cache = resultCache[start--][selector][ptype][index];
            
            for(var tkr in data) {
                val = cache[tkr];
                if(val)
                    data[tkr] *= 1 + val;
                else
                    delete data[tkr]; //must have value for all years
            }
        }
        
        //calc geometric avg
        for(var tkr in data) {
            data[tkr] = Math.pow(data[tkr], 1.0/Math.abs(indicator.aggrSpan)) - 1;
        }
        
        return data;
    }
    
    function cagr(resultCache, selector, ptype, index) {
        var start = resultCache.length - 1;
        var end = start - Math.abs(indicator.aggrSpan) + 1;
        var data = {}, currCache, prevCache, currVal, prevVal;
        
        currCache = resultCache[start][selector][ptype][index];
        prevCache = resultCache[end][selector][ptype][index];
        
        for(var tkr in currCache) {
            currVal = currCache[tkr];
            prevVal = prevCache[tkr];
            
            if(currVal && prevVal && currVal > 0 && prevVal > 0)
                data[tkr] = Math.pow(currVal / prevVal, 1.0/(Math.abs(indicator.aggrSpan) - 1)) - 1;
        }

        return data;
    }
    
    function percentChange(resultCache, selector, ptype, index) {
        var start = resultCache.length - 1;
        var end = start - Math.abs(indicator.aggrSpan) + 1;
        var data = {}, currCache, prevCache, currVal, prevVal;

        currCache = resultCache[start][selector][ptype][index];
        prevCache = resultCache[end][selector][ptype][index];
        
        for(var tkr in currCache) {
            currVal = currCache[tkr];
            prevVal = prevCache[tkr];
            
            if(currVal && prevVal)
                data[tkr] = (currVal - prevVal) / Math.abs(prevVal);
        }
        
        return data;
    }
    
    this.aggregateBy = function(resultCache, selector, ptype, index, currVals, games) {
        var loop = aggrLooper(resultCache, selector, ptype, index, currVals, games);
        
        switch(indicator.aggrType) {
            case 'past': return pastValueBy(loop);
            case 'avg': return avgBy(loop);
            case 'ravg': return relativeAvgBy(loop, currVals); //current value relative to average
            case 'pos': return positiveBy(loop);
            case 'sum': return sumBy(loop);
            case 'chng': return percentChangeBy(loop);
        }
    }
    
    function pastValueBy(loop) {
        var data = {}; 
        
        for(var tkr in loop) {
            data[tkr] = loop[tkr].vals[0];
        }
    
        return data;
    }
    
    function avgBy(loop) {
        var data = {};
        
        for(var tkr in loop) {
            if(loop[tkr].sum != '-') {
                data[tkr] = loop[tkr].sum / loop[tkr].vals.length;
            }
        }
    
        return data;
    }
    
    function relativeAvgBy(loop, currVals) {
        var data = {};
        
        for(var tkr in loop) {
            if(u.defined(currVals[tkr]) && loop[tkr].sum != '-' && loop[tkr].sum != 0) {
                data[tkr] = currVals[tkr] / (loop[tkr].sum / loop[tkr].vals.length);
            }
        }
    
        return data;
    }
    
    function sumBy(loop) {
        var data = {};
        
        for(var tkr in loop) {
            if(loop[tkr].sum != '-') {
                data[tkr] = loop[tkr].sum;
            }
        }
    
        return data;
    }
    
    function percentChangeBy(loop, currVals) {
        var data = {}, currVal, prevVal; 
        
        for(var tkr in loop) {
            currVal = currVals[tkr];
            prevVal = loop[tkr].vals[0];
                
            if(currVal && prevVal) {
                data[tkr] = (currVal - prevVal) / Math.abs(prevVal);
            }
        }
    
        return data;
    }
    
    function positiveBy(loop) {
        var data = {};
        
        for(var tkr in loop) {
            if(loop[tkr].pos != '-') {
                data[tkr] = loop[tkr].pos;
            }
        }
    
        return data;
    }
    
    function aggrLooper(resultCache, selector, ptype, index, currVals, games) {
        var start, span, data = {}, val, game, startSeason;

        for(var tkr in games) {
            if(resultCache[tkr]) {				
                start = resultCache[tkr].length;
                span = indicator.aggrSpanType == 1 ? indicator.aggrSpan : resultCache[tkr].length;
				startSeason = indicator.aggrSpanType == 2 ? resultCache[tkr][start].season : false;
				
				var game = games[tkr];

                if(span <= start) {
                    data[tkr] = { vals:[], sum:0, pos:0 };
                    
                    while(--start >= 0 && (!startSeason || startSeason == resultCache[tkr][start].season)) {
                        if(!indicator.aggrSpanOpp || (game && resultCache[tkr][start].vs == game.vs_id)) {
                            val = resultCache[tkr][start][selector][ptype][index];
                            data[tkr].vals.push(val);
                            
                            if(u.defined(val)) {
                                if(data[tkr].sum != '-') {
                                    data[tkr].sum += val;
                                }
                                
                                if(data[tkr].pos != '-' && val > 0) {
                                    data[tkr].pos++;
                                }
                            }
                            else {
                                data[tkr].sum = '-';
                                data[tkr].pos = '-';
                            }
                            
                            span--;
                            
                            if(span == 0) {
                                break;
                            }
                        }
                    }
                    
                    if(data[tkr].vals.length < Math.abs(indicator.aggrSpan)) {
                        delete data[tkr];
                    }
                }
            }
        }
    
        return data;
    }
    
	this.addValue = function(key, val) {
		values[key] = val;
	}
	
	this.setValues = function(vals) {
		values = vals;
	}
	
	function callDB(date, fields, type, callback, ticker) { //optional ticker, otherwise get values for all tickers
        var tickerArr, dateArr, dateField = cacheOptions.dateField ? cacheOptions.dateField : 'date', multKey = false;
        
        if(ticker && u.isArray(ticker))
            tickerArr = ticker;
          
        if(date && u.isArray(date))
            dateArr = date;

		db.mongo.collection(tables[type], function(error, collection) {
			if(error) {
				callDB(date, fields, type, callback, ticker);
			}
			else {
                var query = {};
				fields.ticker = 1;
				
				if(cacheOptions.addtlFields) {
				   for(var f = 0, flen = cacheOptions.addtlFields.length; f < flen; f++) {
				       fields[cacheOptions.addtlFields[f]] = 1;
				   } 
				}
				
				if(tableConfig[type] && tableConfig[type].mult) {
					multKey = tableConfig[type].mult;
					fields[multKey] = 1;
				}
                
                if(tickerArr)
                    query.ticker = { $in:tickerArr };
                else if(ticker)
                    query.ticker = ticker;
                
                if(date) {
                    if(dateArr) {
                        query[dateField] = { $in:dateArr };
                        fields.date = 1;
                    }
                    else
                        query[dateField] = date;
                    
                    collection.find(query, fields, function(err, cursor) {
                        var vals = {};

                        cursor.each(function(err, result) {
                            if(result == null) {
                                //console.log('Table Time', tables[type], (new Date()).getTime() - st);
    				            callback(vals, type);
                            }
                            else {
                                if(dateArr) {
                                    if(!vals[result.date]) vals[result.date] = {};
                                    vals[result.date][multKey ? (result.ticker + '_' + result[multKey]) : result.ticker] = result;
                                }
                                else
                                    vals[multKey ? (result.ticker + '_' + multKey) : result.ticker] = result;
                                    
                                allCacheKeys[result.ticker] = 1;
                            }
    				    });
    				});
                }
                else {
                    fields.date = 1;
                    query.date = { $gt:(BACKTEST_DATE - 100000) }; //minus 100000 converts current date to 10 years ago
                 
                    //group by date
                    var hint = query.ticker ? { hint:{ ticker:1, date:1 } } : { hint:{ date:1 } };
                    
                    collection.find(query, fields, hint, function(err, cursor) {
            			var vals = {};
    					
    					cursor.each(function(err, result) {
    					    if(result == null)
    					        callback(vals, type);
    					    else {
                                vals[result.date] = result;
                                allCacheKeys[result.date] = 1;
    					    }
    				    });
    				});
                }
			}
		});
	}
}