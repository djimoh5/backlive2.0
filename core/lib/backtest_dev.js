require("../../js/include/psmathstats.js");
require("../../js/lib/jstat-1.0.0.js");
require("../../js/stats.js");
require("../../js/lib/dcf.js");

var tickerCache = {};

Backtest = function() {
    var id;
    var isScreen = false;
	var currPrices = {}, splitPrices = {}, basketPrices = {}, dividends = {}, currTickers = [];
	var basket = {}, basketQ = [], basketExposure = { long:1, short: 1 }, stoppedOut = {}; //quintiles; 
	var indicators = {}, exposure = {}, exclusions = [], allIndicators = [];
	var results = {}, indicatorResults = {}, rankByInd = {}, exclByInd = {};
	var siDates = [], siWeeks = [], siDate = 0, prevDate = 0, cacheDateArr = {};

    var cacheDates = [];
	var initYear;
	var initCapt = 100000;
	var capt = initCapt, prevCapt;
    var captQ = []; //quintiles
	var basketSize;
	var dateIndex = 0;
    var rollDateIndex = 0;
	
	var startDate, endDate, indicators;
	var hasIndWeights = { long:false, short:false };
	var startTime;
	var resultCache = [], sresultCache = [];
	var lastCalcCache, lastCacheKeys;
    //var cache = new Cache();
	var cacheMax = 7;
	var relRange = 1; //YoY
	
	var trades = [];
	var settings;
	var rebalance = 1;
	var rebalancing = false, rebalanceWeekly = false, rebalanceDaily = false, lastRebalanceDate = 0;
    var totFriction = 0;
    var totCacheTime = 0, totTickerTime = 0, totCodeTime = 0;
    var quintiles = 5;
    var logCapital = false;
    var rollDates = [];
    var marketTicker = "SP500";
    var marketPrices = null;
    
    var userStrategy;
    
    //constants
    var reportingEndMonth = 3;
    
	this.run = function(backtestId, params, strategy) {
		settings = params;
		userStrategy = strategy;
		
		console.log(settings);
		
        for(i = 0; i < quintiles; i++) {
            basketQ.push({});
            captQ.push(initCapt);
        }
		
		for(var i = 0; i <= cacheMax; i++) {
			resultCache[i] = { indicators:{ long:[], short:[] }, exclusions:[], exposure:{ long:[], short:[] } }; //once a year cache
			sresultCache[i] = { indicators:{ long:[], short:[] }, exclusions:[], exposure:{ long:[], short:[] } }; //every period cache
		}
		
		id = backtestId;
		startTime = (new Date()).getTime();
		
		if(params.startYr) {
			var start = params.startYr.toString();
			var end = params.endYr.toString();
		}
		else {
			var start, end;
			isScreen = true;
			
			if(settings.date) {
			    start = settings.date + "";
			    reportingEndMonth = parseInt(start.substring(4, 6));
			}
			else {
			    var today = new Date();
			    start = today.getFullYear() + u.padMonth(today.getMonth() + 1) + u.padMonth(today.getDate());
			}
			    
			end = start;
		}

		basketSize = params.numStocks;
		indicators = params.indicators;
		exposure = params.exposure;
        exclusions = params.exclusions;
        
        settings.friction = settings.friction / 100;
        settings.leverage = { long:settings.leverage, short:settings.shortLeverage };
        
        if(settings.rebalance < 0) { //weekly and daily rebalancing uses negative numbers
            if(settings.rebalance == -99) {
                rebalanceDaily = true;
                rebalanceWeekly = true; //rebalance day trading portfolio weekly
                settings.rebalance = 1;
                
                //add price > 0 indicator to all daily backtest, we will also use this price to replace that in currPrices
                for(var ptype in indicators) {
                    if(indicators[ptype].length > 0) {
                        indicators[ptype].push({ aggrType:'val', ops:[], vars:[[6, 'price']], sortDesc:-1, isPrice:true });
                        break;
                    }
                }
            }
            else
                settings.rebalance *= -1;

            rebalanceWeekly = true;
        }
        
        if(settings.initCapt) {
            capt = initCapt = settings.initCapt;
            
            captQ = [];
            for(i = 0; i < quintiles; i++) {
                captQ.push(settings.initCapt);
            }
        }

		if(indicators.long.length > 0 || indicators.short.length > 0 || exposure.long.length > 0) {
		    allIndicators = indicators.long.concat(indicators.short, exposure.long, exclusions);
		    
		    for(var ptype in indicators) {
		        for(var i = 0, len = indicators[ptype].length; i < len; i++) {
                    if(indicators[ptype][i].weight > 0) {
                        hasIndWeights[ptype] = true;
                        break;
                    }
		        }
		    }
		    
            u.getDates(function(results, weeks) {
                siWeeks = weeks;
                var currYear, startYear = parseInt(start.substring(0, 4)) - cacheMax - 1;
                var prevMonth;
         
				for(var i = 0, cnt = results.length; i < cnt; i++) {
					var result = results[i] + "";
                    var year = parseInt(result.substring(0, 4)), month = parseInt(result.substring(4, 6));
					siDates.push(u.date(year, month - 1, result.substring(6, 8)));
					//siDatesStr.push(result);
                    
                    if(prevMonth != month) {
                        prevMonth = month;
                        cacheDateArr[result.substring(0, 6)] = [results[i]];
                    }
                    else
                        cacheDateArr[result.substring(0, 6)].push(results[i]);

                    //year dates to preload for aggregates
                    if(currYear != year && month >= reportingEndMonth && results[i] < parseInt(start)) {
                        currYear = year;
                        
                        if(currYear >= startYear)
                            cacheDates.push([result, 1]); //1 for yearly
                    }
				}
				
				startDate = u.date(start.substring(0, 4), start.substring(4, 6) - 1, start.substring(6, 8));
				endDate = u.date(end.substring(0, 4), end.substring(4, 6) - 1, end.substring(6, 8));
				
				for(var i = siDates.length - 1, lastDate; i >= 0; i--) {
					lastDate = siDates[i];
				
					if(endDate >= lastDate) {
						endDate = new Date(lastDate.getTime());
						if(startDate >= lastDate)
							startDate = new Date(lastDate.getTime());
						
						break;
					}
				}
				
				//pop any dates not being used
				while(startDate > siDates[dateIndex]) {
					dateIndex++;
				}

				startDate = siDates[dateIndex];
				initYear = startDate.getFullYear();
                console.log(startDate.toDateString());
                console.log(endDate.toDateString());
				
				//period aggregate dates
				var numPeriods = cacheMax + 1, cachePeriods = [];
				var startPerDate = startDate.format();
				
				if(rebalanceDaily) {
				    var yday;
				    if(isScreen && !settings.date) {
				        yday = new Date();
				        yday.setDate(yday.getDate() - 1);
				    }
				    else
				        yday = new Date(startDate.getTime());
				        
				    while(numPeriods > 0) {
				        yday.setDate(yday.getDate() - 1);
				        cachePeriods.unshift([yday.format() + "", 0]);
        				numPeriods--;
				    }
				}
				else {
    				for(var i = results.length - 1; i >= 0; i--) {
    				    if(results[i] < startPerDate) {
        				    if(siWeeks[i] == 1 || rebalanceWeekly) {
        				        cachePeriods.unshift([results[i] + "", 0]); //0 monthly
        				        numPeriods--;
        				    }
        				    
        				    if(numPeriods == 0)
        				        break;
    				    }
    				}
				}
				
                cacheDates = cacheDates.concat(cachePeriods);
                preloadCache();
			}, -1);
		}
        else
            process.exit(0);
	}
    
    function preloadCache() { //needed to support aggregation values
        //check if any indicators require aggregation
        var plIndicatorsYr = [], plIndicatorsMth = [];

        //indicators
        for(var ptype in indicators) {
            for(var i = 0, len = indicators[ptype].length; i < len; i++) {
                if(indicators[ptype][i].aggrType != 'val') {
                    if(indicators[ptype][i].aggrSpan > 0)
                        plIndicatorsYr.push(indicators[ptype][i]);
                    else
                        plIndicatorsMth.push(indicators[ptype][i]);
                }
            }
        }
        
        //exclusions
        for(var i = 0; i < exclusions.length; i++) {
    		if(exclusions[i].aggrType != 'val') {
    		    if(exclusions[i].aggrSpan > 0)
                    plIndicatorsYr.push(exclusions[i]);
                else
                    plIndicatorsMth.push(exclusions[i]);
    		}
		}
                
        //exposure
		for(var i = 0; i < exposure.long.length; i++) {
			if(exposure.long[i].aggrType != 'val') {
			    if(exposure.long[i].aggrSpan > 0)
                    plIndicatorsYr.push(exposure.long[i]);
                else
                    plIndicatorsMth.push(exposure.long[i]);
			}
		}
        
        if((plIndicatorsYr.length > 0 || plIndicatorsMth.length > 0) && cacheDates.length > 0) {
            var cdate = cacheDates.shift();
            var isYear = cdate[1] == 1;
            siDate = cdate[0];
            
            if((isYear && plIndicatorsYr.length > 0) || (!isYear && plIndicatorsMth.length > 0)) {
                console.log('pre-caching ', siDate);
                rebalancing = true;
                loadTickers(rebalanceDaily ? startDate.format() : siDate, function() {
                    execute(preloadCache, isYear ? plIndicatorsYr : plIndicatorsMth, null, !isYear && rebalanceDaily ? [6] : null);
                });
            }
            else
                preloadCache();
        }
        else
            startBacktest();
    }
    
    function startBacktest() {
        currPrices = {};
        
        if(userStrategy) {
            basket = userStrategy.basket;

            if(userStrategy.capt)
                capt = userStrategy.capt;
        }
        
        console.log('strat', userStrategy)
        if(startDate.getTime() == endDate.getTime() && !userStrategy) {
			//stock screen
            siDate = "" + startDate.getFullYear() + u.padMonth(startDate.getMonth() + 1) + u.padMonth(startDate.getDate());
			
            console.log("stock screen for " + siDate);
            dateIndex++; //execute method expects date index is one ahead
            
            if(rebalanceDaily && !settings.date) {
                loadTickers(siDate, function() {
                    execute(function() {
                        siDate = new Date();
                        siDate.setDate(siDate.getDate() - 1);
                        siDate = siDate.format() + "";
                        console.log('daily today screen', siDate);
                        execute(null, null, null, [6]);
                    });
                });
            }
            else
                loadTickers(siDate, execute);
		}
		else {           
			startDate.setDate(startDate.getDate() - 1); //set to yesterday since next day increments by 1 day
            nextDay();
		}
    }
	
	function nextDay() {
		startDate.setDate(startDate.getDate() + 1);
		logCapital = false;
		rebalancing = false;
		
		if(startDate < endDate || (userStrategy && startDate.getTime() == endDate.getTime())) { //strategy updates should never "finish" (exit all positions)
            if(startDate.getTime() == siDates[dateIndex].getTime()) {
                prevDate = siDate;
		        siDate = startDate.format() + "";
		
                //check if we are at first week in the month
                if(siWeeks[dateIndex] == 1 || rebalanceWeekly) {
                    logCapital = siWeeks[dateIndex] == 1 ? true : false;
                    
    				if(rebalance == 1) {
    					rebalance = settings.rebalance;
    					dateIndex++;
    					
    					console.log(startDate.toDateString());
    					rebalancing = true;
    					loadTickers(siDate, execute);
    				}
    				else {
    					rebalance--;
    					dateIndex++;
                        processPositionExits();
    				}
                }
                else {
                    dateIndex++;
                    processPositionExits();
                }
			}
			else if(rebalanceDaily) {
		        siDate = startDate.format() + "";
                processPositionExits();
			}
			else
				nextDay();
		}
		else if(startDate.getTime() == endDate.getTime()) {
			siDate = startDate.format() + "";
			console.log("Backtest complete, exiting all positions " + startDate.toDateString());
            
            loadTickers(siDate, finish);
		}
		else if(userStrategy)
		    userStrategy.callback(basket, currPrices, basketPrices);
		else
			process.exit(0); //stock screen ran or strategy update;
	}
    
	function loadTickers(date, callback) {
		date = parseInt(date);
		splitPrices = {};
		basketPrices = {}; //holds most recent basket price if needed (basket only has trade open price)
		dividends = {};
		
		currPrices = {};
        currTickers = [];

		if(indicators.long.length > 0 || indicators.short.length > 0) {
			if(tickerCache[date]) {
				loadPrices(tickerCache[date], callback);
			}
			else {
                var sCacheTime = (new Date()).getTime();
                var tkrQuery = {"date":date};
                
                if(settings.universeType == 'etf') {
                    db.mongo.collection('etf_c', function(error, collection) {
    					collection.findOne(tkrQuery, function(err, result) {
    						if(err) {
    							console.log('Mongo Exception: ' + err.message);
    							loadTickers(date, callback);
    						}
    						else {
                                var cacheTime = (new Date()).getTime() - sCacheTime;
                                totTickerTime += cacheTime;
                                //console.log('T Time', cacheTime);
                                
                                loadPrices(result.data, callback);
    						}
    					});
    				});
                }
                else {
    				db.mongo.collection('tickers_c', function(error, collection) {
    					collection.findOne(tkrQuery, function(err, result) {
    						if(err) {
    							console.log('Mongo Exception: ' + err.message);
    							loadTickers(date, callback);
    						}
    						else {
                                var cacheTime = (new Date()).getTime() - sCacheTime;
                                totTickerTime += cacheTime;
                                //console.log('T Time', cacheTime);
                                 			
                                //tickerCache[date] = results[0].data;
    							loadPrices(result.data, callback);
    						}
    					});
    				});
                }
			}
		}
		else {
			//backtest market
            basketSize = 1;
            loadPrices([], callback);
		}
	}
	
	function loadPrices(results, callback) {
	    var lrdFormatted = lastRebalanceDate ? lastRebalanceDate.format() : null;
	    var tradeDateSplit, tradeDateDiv;
	    
	    if(settings.universeType == 'etf') {
	        for(var i = 0, cnt = results.length; i < cnt; i++) {
    			var result = results[i];
    			
    			if((!settings.asset || settings.asset == result.as) && (!settings.geo || settings.geo == result.go))
                {
                    if(basket[result.t]) {
                        tradeDateSplit = u.parseDate(basket[result.t].date, 3);
                        tradeDateDiv = basket[result.t].date;
                    }
                    else if(lastRebalanceDate) {
                        tradeDateSplit = lastRebalanceDate;
                        tradeDateDiv = lrdFormatted;
                    }
                    
    				//dividends
    				if(result.dvp && tradeDateDiv && tradeDateDiv < result.dvx)
    					dividends[result.t] = { price:result.dvp, type:result.dvt };
    				
                    currPrices[result.t] = { ticker:result.t, indus:'00', sector:'00', mktcap:1, price:result.p };
                    currTickers.push(result.t);
    			}
    		}
    		
	        finishLoad();
	    }   
	    else {
        	for(var i = 0, cnt = results.length; i < cnt; i++) {
    			var result = results[i];
    			
    			if(!u.inArray(result.s, settings.exclSectors) && 
                    (!settings.exchange || settings.exchange == result.x) && 
                    (!settings.index || (settings.index == 'sp' && result.sp == 500) || (settings.index == 'dow' && result.dw == 'DI')) &&
                    (settings.adr == 1 || !result.adr))
                {
                    if(basket[result.t]) {
                        tradeDateSplit = u.parseDate(basket[result.t].date, 3);
                        tradeDateDiv = basket[result.t].date;
                    }
                    else if(lastRebalanceDate) {
                        tradeDateSplit = lastRebalanceDate;
                        tradeDateDiv = lrdFormatted;
                    }
                    
                    //splits
        			if(result.s_d != null && result.s_f != null && result.s_f != 0 && tradeDateSplit && tradeDateSplit < result.s_d)
        				splitPrices[result.t] = result.p * result.s_f;
        				
        			//dividends
        			if(result.dvp && tradeDateDiv && tradeDateDiv < result.dvx)
        				dividends[result.t] = { price:result.dvp, type:result.dvt };
                    
                    currPrices[result.t] = { ticker:result.t, indus:result.i, sector:result.s, mktcap:result.m, price:result.p };
                    
                    if(!((settings.minMktCap && result.m < settings.minMktCap) || (settings.maxMktCap && result.m > settings.maxMktCap)))
                        currTickers.push(result.t);
    			}
    		}
    		
    		finishLoad();
	    }
	    
	    function finishLoad() {
            if(exposure.long.length > 0) {
                var queryDate = parseInt(siDate);
                db.mongo.collection('tickers', function(error, collection) {
            		collection.findOne({"date":queryDate, "ticker":marketTicker }, function(err, result) {
                        if(result) {
            			    currPrices[result.ticker] = result;
            			    
                            //get price
                            if(marketPrices == null) {
                                console.log('load market prices');
                                db.mongo.collection('tech', function(error, collection) {
            		                collection.find({"date":{ $gte:queryDate }, "ticker":"SPY" }, { date:1, price:1 }).toArray(function(err, results) {
            		                   marketPrices = results;
            		                   loadMarketPrices();
            		                });
                                });
                                /*var model = require("../model/data.js").model;
                                model = new model(['prices', { ticker:'SPY' }], function(data) {
                                    marketPrices = data;
                                    loadMarketPrices();
                                });*/
                            }
                            else
                                loadMarketPrices();
                            
                            function loadMarketPrices() {
                                while(marketPrices.length > 1 && marketPrices[0].date < queryDate) {
                                    marketPrices.shift();
                                }
                                
                                currPrices[marketTicker].price = marketPrices[0].price; //marketPrices[0].adjClose;
                                currPrices[marketTicker].sector = '00';
                                currTickers.push(marketTicker);
                                
                                callback();
                            }
                        }
                        else    
                            callback();
            		});
                });
            }
            else
    		    callback();
	    }
	}
	
	function dailyExecute(callback) {
	    execute(callback, null, null, [6]);
	}
	
	function dailySetPrices(prices) {
	    for(var tkr in prices) {
	        currPrices[tkr].price = prices[tkr];
	    }
	}
	
	function execute(optionalCallback, plIndicators, expOnly, inclIndTypes) {
		results = { indicators:{ long:[], short:[] }, exposure:{ long:[], short:[] }, exclusions:[] };
        rankByInd = { indicators:{ long:[], short:[] }, exclusions:[] };
        exclByInd = { indicators:{ long:[], short:[] }, exclusions:[] };
		
		//backtest values caching
        var updateCache = false, updateMthCache = false, currYear = siDate.substring(0, 4), currMonth = parseInt(siDate.substring(4, 6));

        if(!rebalanceDaily && resultCache[cacheMax].year != currYear && currMonth >= reportingEndMonth) { //yearly cache start after month 3 to ensure past reporting date
		    resultCache.shift();
	    	resultCache[cacheMax] = { indicators:{ long:[], short:[] }, exclusions:[], exposure:{ long:[], short:[] }, year:currYear };
            updateCache = true;
        }
        
        if(rebalanceDaily || rebalancing || logCapital) { //sresultCache[cacheMax].month != currMonth) {
            sresultCache.shift();
	        sresultCache[cacheMax] = { indicators:{ long:[], short:[] }, exclusions:[], exposure:{ long:[], short:[] }, month:currMonth };
	        updateMthCache = true;
        }
        
        var currYrMth = siDate.substring(0, 6);
        
        /*if(prevDate && prevDate.substring(0, 6) == currYrMth) {
            executeCache(lastCalcCache, lastCacheKeys); //still in same month so just process from cache
        }
	    else {*/
            var sCacheTime = (new Date()).getTime();
            //console.log(cacheDateArr[currYrMth]);
            
            (new Calculation()).cache(plIndicators ? plIndicators : allIndicators, siDate, function(calcCache, allCacheKeys) {
    		//(new Calculation()).cache(plIndicators ? plIndicators : allIndicators, cacheDateArr[currYrMth], function(calcCache, allCacheKeys) {
                var cacheTime = (new Date()).getTime() - sCacheTime;
                totCacheTime += cacheTime;
                //console.log('I Time', cacheTime);
                
                if(inclIndTypes) { //may have fundamentals in last cache we need so just copy over new technicals to it
                    if(!lastCalcCache) lastCalcCache = {};
                    
                    for(var i = 0, len = inclIndTypes.length; i < len; i++) {
                        var hasData = false;
                        for(var key in calcCache[inclIndTypes[i]]) {
                            hasData = true;
                            break;
                        }

                        if(hasData)
                            lastCalcCache[inclIndTypes[i]] = calcCache[inclIndTypes[i]];
                        else
                            updateMthCache = false;
                    }
                    
                    calcCache = lastCalcCache;
                }
                else if(!expOnly)
                    lastCalcCache = calcCache;
                    
                lastCacheKeys = allCacheKeys;
                executeCache(calcCache, allCacheKeys);
    	    }, expOnly ? marketTicker : (settings.universeTkrs.incl && settings.universeTkrs.tkrs.length > 0 ? settings.universeTkrs.tkrs : currTickers), inclIndTypes);
	    //}
	    
		function executeCache(calcCache, allCacheKeys) {
            var sCacheTime = (new Date()).getTime(); //start for code time
            var indVals = { long:[], short:[] }, vals;
            
        	if(settings.grpscreen)
        		calcCache = calc.groupCache(calcCache, currPrices, settings.grpscreen);
            
            if(!expOnly) {
                //exclusions
                for(var i = 0; i < exclusions.length; i++) {
        			var calc = (new Calculation()).init(exclusions[i], exclusions[i].allowNeg);
                    calc.addValue("allCacheKeys", allCacheKeys);
                    vals = calc.calculate(null, calcCache);
                    //vals = calc.calculate(siDate, calcCache);
    
                    results.exclusions[i] = { 'all':vals };
    			}
                
                //indicators
                for(var ptype in indicators) {
        			for(var i = 0, len = indicators[ptype].length; i < len; i++) {
        			    if(plIndicators && indicators[ptype][i].aggrType == 'val')
        			        continue; //pre-caching and indicator isn't in cache list
        			    
        				var calc = (new Calculation()).init(indicators[ptype][i], indicators[ptype][i].allowNeg);
        				calc.addValue("allCacheKeys", allCacheKeys);
                        vals = calc.calculate(null, calcCache);
                        //vals = calc.calculate(siDate, calcCache);
                        //console.log(vals);
                        
                        results.indicators[ptype][i] = { 'all':{} };
                        rankByInd.indicators[ptype][i] = {};
        
                	    //cache past values so we can use them in aggregates and relative restrictions
                        if(indicators[ptype][i].aggrType != 'val') {
                		    if(updateCache)
                			    resultCache[cacheMax].indicators[ptype][i] = vals;
    
                		    if(updateMthCache)
                		        sresultCache[cacheMax].indicators[ptype][i] = vals;
    
                            if(!optionalCallback) {
                                var tmpVals = calc.aggregate(indicators[ptype][i].aggrSpan > 0 ? resultCache : sresultCache, 'indicators', ptype, i, vals);
                                if(tmpVals) vals = tmpVals;
                            }
                        }
                        
                        indVals[ptype].push(vals);
                        
                        if(indicators[ptype][i].isPrice)
                            dailySetPrices(vals);
        			}
                }
            }
            
            //exposure
			for(var i = 0; i < exposure.long.length; i++) {
			    if(!expOnly && plIndicators && exposure.long[i].aggrType == 'val')
    			    continue; //pre-caching and indicator isn't in cache list
    			        
				var calc = (new Calculation()).init(exposure.long[i], exposure.long[i].allowNeg);
                calc.addValue("allCacheKeys", allCacheKeys);
                vals = calc.calculate(null, calcCache, null, marketTicker);
                //vals = calc.calculate(siDate, calcCache, null, marketTicker);
                results.exposure.long[i] = { 0:vals[0] };
                
                if(exposure.long[i].aggrType != 'val') {
                    if(updateCache)
                        resultCache[cacheMax].exposure.long[i] = vals;
                    
                    if(updateMthCache)
                        sresultCache[cacheMax].exposure.long[i] = vals;
                    
                    if(!optionalCallback || expOnly) {
                        var tmpVals = calc.aggregate(exposure.long[i].aggrSpan > 0 ? resultCache : sresultCache, 'exposure', 'long', i, vals);
                        if(tmpVals) vals = tmpVals;
                        //console.log(vals);
                    }
                }
			}
			
            if(optionalCallback)
                optionalCallback();
            else if(settings.grpscreen) {
                console.log('sending', indVals);
                process.send({ event:'_gs', data:indVals });
                process.exit();
            }
            else if(settings.dcf)
                dcf(indVals);
            else
                calculate(indVals);
            
            totCodeTime += (new Date()).getTime() - sCacheTime;
		}
	}
	
	function calculate(indVals) {
        if(indVals.long.length == 0 && indVals.short.length == 0) {
    		processBasket({ long:[marketTicker], short:[] });
            return;
        }
		 
    	var sectorAll = 'all';

        for(var t = 0, tlen = currTickers.length; t < tlen; t++) {
            var tkr = currTickers[t];
			var tkrData = currPrices[tkr];
			var sector = tkrData.sector;
			
            if(tkr == marketTicker)
                continue;
  
            for(var ptype in indVals) {
                var tkrExcl = false;
                var indLen = indVals[ptype].length;
                
                for(var index = 0; index < indLen; index++) {
                    var val = indVals[ptype][index][tkr], ind = indicators[ptype][index];
                    //val = Math.random(), ind = indicators[index];
    				
    				if(u.validValue(val)) {
                        if(ind.rankIndustry) {
    						if(!results.indicators[ptype][index][sector])
    							results.indicators[ptype][index][sector] = {};
    						
    						results.indicators[ptype][index][sector][tkr] = val;
    						results.indicators[ptype][index][sectorAll][tkr] = val;
    					}
    					else
    						results.indicators[ptype][index][sectorAll][tkr] = val;
    				} 
    				else if(ind.weight > 0 || ind.sortDesc == -1) //weight or no sort, must have value
                        tkrExcl = excludeTicker(tkr, index, ptype);

                    if(tkrExcl) {
                        if(index > 0) { //remove from all previous indicator results                                
                            for(var i = index - 1; i >= 0; i--) {
                                if(indicators[ptype][i].rankIndustry && results.indicators[ptype][i][sector])
                                    delete results.indicators[ptype][i][sector][tkr];
                                delete results.indicators[ptype][i][sectorAll][tkr];
                            }
                        }
                        
                        break;
                    }
                }
            }
        }
               
        indicatorResults = results.indicators;
    	processBasket({ long:percentRank(indicators.long, results.indicators.long, rankByInd.indicators.long, hasIndWeights.long), short:percentRank(indicators.short, results.indicators.short, rankByInd.indicators.short, hasIndWeights.short) });
    }
    
    function dcf(indVals) {
        console.log('DCF!!!!!!');
        DCF.calculate(indicators, indVals, currPrices, currTickers, results);
        processBasket({ long:percentRank(indicators.long, results.indicators.long, rankByInd.indicators.long, hasIndWeights.long), short:percentRank(indicators.short, results.indicators.short, rankByInd.indicators.short, hasIndWeights.short) });
    }
	
    function excludeTicker(tkr, indIndex, ptype) {
        if(ptype != null) {
            if(exclByInd.indicators[ptype][indIndex])
                exclByInd.indicators[ptype][indIndex]++;
            else
                exclByInd.indicators[ptype][indIndex] = 1;
        }
        else {
            if(exclByInd.exclusions[indIndex])
                exclByInd.exclusions[indIndex]++;
            else
                exclByInd.exclusions[indIndex] = 1;
        }
            
        return true;
    }
	
	function percentRank(indicators, results, rankByInd, hasWeights) {
		var testData = {};
		var indLen = indicators.length;

		for(var i = 0; i < indLen; i++) {
			var ind = indicators[i];
			
			for(var sector in results[i]) {
				if(!ind.rankIndustry || sector != 'all') {
					var keys = u.sortKeysByValue(results[i][sector], ind.sortDesc);
					var len = keys.length;
					var inc = 1.0 / len;

					for(var j = 0; j < len; j++) {
						var rank = 1.0 - (j * inc);
						var ticker = keys[j];
                        
                        if(ind.weight > 0) {
							if(testData[ticker])
								testData[ticker] += rank * ind.weight;
							else
								testData[ticker] = rank * ind.weight;
						}
						else if(!hasWeights)
                            testData[ticker] = Math.random();
                            
                        rankByInd[i][ticker] = rank;
					}
				}
			}
		}
        
        return u.sortKeysByValue(testData, true);
	}
	
	function processBasket(tkrs) {
	    var orderTkrs = { long:[], short:[] }, posWeight = { long:[], short:[] }, posSize = { long:[], short:[] };
		var tkrsLen = { long:tkrs.long.length, short:tkrs.short.length }, numStocks = { long:basketSize, short:basketSize };
	    var sectCnt = { long:{}, short:{} }, sectMax;
		var usedTkrs = {}; 
		
		//get current exposure
		var expAdj = processExposure();
		
		if(!isScreen && tkrs.long.length == 0 && tkrs.short.length == 0 && basketExposure.long == expAdj.long && basketExposure.short == expAdj.short) {
            if(logCapital)
                logCurrentCapital();
            nextDay();
            return;
        }
        else
            basketExposure = expAdj;
            
        //console.log("current exposure", expAdj.long, expAdj.short);
        
	    if(rebalancing) {
	        processQuintiles(tkrs);
	        lastRebalanceDate = new Date(startDate.getTime());
	    }
	    else {
	        //just filling basket, so push existing tickers
		    for(var tkr in basket) {
		        if(currPrices[tkr]) {
    		        var ptype = basket[tkr].short ? 'short' : 'long';
    		        orderTkrs[ptype].push(tkr);
    		        usedTkrs[tkr] = 1;
    		        
    		        if(!sectCnt[ptype][basket[tkr].sector]) 
    		            sectCnt[ptype][basket[tkr].sector] = 0;
    		        sectCnt[ptype][basket[tkr].sector]++;
		        }
		        else {
		            console.log(tkr, ' no longer exists');
		        }
		    }
	    }
	    
	    //first exit any positions not in new basket
        var keepBasketShares = {}; //save current shares so we know how much we actually need to trade if taking same position later
		for(var tkr in basket) {
		    if(usedTkrs[tkr]) {
		        keepBasketShares[tkr] = basket[tkr];
		        exitBasketShares(tkr, true);
		    }
		    else
		        exitBasketShares(tkr);
		}
        
		basket = {};
		logTrades(true);
	    
	    var prevCapt = capt
        var startCap = { long:prevCapt * expAdj.long, short:prevCapt * expAdj.short };
        
		//log current amount of capital, friction, and exposure
        if(logCapital)
            log({ date:startDate.getTime(), capital:u.round(capt, 2), capitalQ:captQ, status:1, excl:exclByInd, friction:u.round(totFriction, 2), exp:{ l:expAdj.long, s:expAdj.short } }, "_cp");

        //now get tickers for portfolio
        if(settings.sectNeutral) //set the max number of tickers per sector
		    sectMax = parseInt(Math.ceil(basketSize / (12.0 - settings.exclSectors) * (settings.sectNeutral == 2 ? 2 : 1))); //2 is BLL sector neutrality, allows for a less diversity
            
        for(var ptype in tkrs) {
            var ns = numStocks[ptype] - orderTkrs[ptype].length;

            for(var i = 0; i < ns; i++) {
                if(i >= tkrsLen[ptype]) //may have less tickers than requested basket size
                    break;
                
                var tkr = tkrs[ptype][i];
                    
                if(isExcluded(tkr, ptype) || usedTkrs[tkr]) {
                    tkrs[ptype].splice(i, 1);
                    tkrsLen[ptype]--;
                    i--;
                }
                else {
                    if(sectMax) { //check for sector neutrality
                        var sector = currPrices[tkr].sector;
                        if(!sectCnt[ptype][sector]) sectCnt[ptype][sector] = 0;
                            
                        if(sectCnt[ptype][sector] < sectMax) {
                            sectCnt[ptype][sector]++;
                            orderTkrs[ptype].push(tkr);
                            usedTkrs[tkr] = 1;
                        }
                        else {
                            //exclude ticker for exceeding sector max
                            tkrs[ptype].splice(i, 1);
                            tkrsLen[ptype]--;
                            i--;
                        }
                    }
                    else {
                        orderTkrs[ptype].push(tkr);
                        usedTkrs[tkr] = 1;
                    }
                }
            }
            
            //console.log('Sectors Allocation: ', sectCnt, ptype, numStocks[ptype]);
        }
        
        stoppedOut = {}; //reset stopped out
        numStocks.long = orderTkrs.long.length;
        numStocks.short = orderTkrs.short.length;
        
        //calculate position size after final tally of number of stocks
        var posSize = { long:(settings.leverage.long * startCap.long / numStocks.long), short:(settings.leverage.short * startCap.short / numStocks.short) };
        
        if(orderTkrs.short.length == 0)
            delete orderTkrs.short;
            
        if(orderTkrs.long.length == 0)
            delete orderTkrs.long;
            
        if(!orderTkrs.long && !orderTkrs.short)
            makeTrades();
        else if(settings.weight == 3)
            volatility(orderTkrs, makeTrades);
        else if(settings.weight == 5 || settings.weight == 6)
            minCorrelation(orderTkrs, makeTrades);
        else
            makeTrades();
            
        function makeTrades(tkrVolatility) {
            //get weighted position sizes
            for(var ptype in orderTkrs) {
                switch(settings.weight) {
                    case 1: //score weighted
                        var tot = 0, weightFactor = 3;
                        for(var i = 1; i <= numStocks[ptype]; i++) {
                            tot += Math.pow(i, 1/weightFactor);
                		}
                        
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] = Math.pow(numStocks[ptype] - i, 1/weightFactor) / tot;
                		}
                        break;
                    case 2: //market cap weighted
                        var tot = 0, weightFactor = 5;
                        for(var i = 0; i < numStocks[ptype]; i++) {
                    	    tot += Math.pow(currPrices[orderTkrs[ptype][i]].mktcap, 1/weightFactor);
                		}
                        
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] = Math.pow(currPrices[orderTkrs[ptype][i]].mktcap, 1/weightFactor) / tot;
                		}
                        break;
                    case 4: //reverse market cap weighted
                        var tot = 0, weightFactor = 5;
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            tot += Math.pow(1 / currPrices[orderTkrs[ptype][i]].mktcap, 1/weightFactor);
                		}
                        
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] = Math.pow(1 / currPrices[orderTkrs[ptype][i]].mktcap, 1/weightFactor) / tot;
                		}
                        break;
                    case 3: //volatility weighted;
                        var tkrVols = {}, avg = 0, numAvg = 0, posScale = 0, weightFactor = 1;
                        
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            var vol = tkrVolatility[orderTkrs[ptype][i]] ? tkrVolatility[orderTkrs[ptype][i]].vol20 : 0;

                            if(vol && vol != NO_VALUE) {
                                vol = Math.pow(vol, 1 / weightFactor);
                                tkrVols[orderTkrs[ptype][i]] = vol;
                                avg += vol;
                                numAvg++;
                            }
                            else
                                tkrVols[orderTkrs[ptype][i]] = 0;
                		}
                        
                        console.log('Volatility:', tkrVols);
                        
                        avg = numAvg > 0 ? (avg / numAvg) : 1;
                        //console.log('Average Volatility: ', avg);
                        
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] = avg / (tkrVols[orderTkrs[ptype][i]] == 0 ? avg : tkrVols[orderTkrs[ptype][i]]);
                            posScale += posWeight[ptype][i];
                		}
                        
                        posScale = 1 / posScale //need to scale back down weights since it may be greater that 100% of capital now
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] *= posScale;
                    	}
                        
                        //console.log('Position Weights:', posWeight[ptype]);
                        break;
                    case 5: //min. corr
                    case 6: //min. corr / score
                        var tkrWeights = {}, avg = 0, numAvg = 0, posScale = 0, weightFactor = 1;
                        var weights = tkrVolatility[ptype];

                        for(var i = 0; i < numStocks[ptype]; i++) {
                            var weight = weights[orderTkrs[ptype][i]] ? weights[orderTkrs[ptype][i]] : 0;
                            
                            if(weight && weight != NO_VALUE) {
                                weight = Math.pow(weight, 1 / weightFactor);
                                tkrWeights[orderTkrs[ptype][i]] = weight;
                                avg += weight;
                                numAvg++;
                            }
                            else
                                tkrWeights[orderTkrs[ptype][i]] = 0;
                    	}
                        
                        //console.log('Weights:', tkrWeights);
                        
                        avg = numAvg > 0 ? (avg / numAvg) : 1;
                        //console.log('Average Weight: ', avg);
                        
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] = tkrWeights[orderTkrs[ptype][i]] == 0 ? avg : tkrWeights[orderTkrs[ptype][i]];
                            posScale += posWeight[ptype][i];
                		}
                        
                        posScale = 1 / posScale //need to scale back down weights since it may be greater that 100% of capital now
                        for(var i = 0; i < numStocks[ptype]; i++) {
                            posWeight[ptype][i] *= posScale;
                    	}
                        
                        //console.log('Position Weights:', posWeight[ptype]);
                        
                        if(settings.weight == 6) {
                            //start testing combining score weights with min correlation
                            var tot = 0, weightFactor = 3;
                            for(var i = 1; i <= numStocks[ptype]; i++) {
                                tot += Math.pow(i, 1/weightFactor);
                        	}
                            
                            for(var i = 0; i < numStocks[ptype]; i++) {
                                var scoreWeight = Math.pow(numStocks[ptype] - i, 1/weightFactor) / tot;
                                posWeight[ptype][i] = (posWeight[ptype][i] + scoreWeight) / 2;
                    		}
                            //end testing combining score weights with min correlation
                        }
                        
                        break;
        	    }
            }
            
            var weighted = posWeight.long.length > 0 || posWeight.short.length > 0;
            var basketSizeFactor = 1, tradeDate = startDate.format();
            
            for(var ptype in orderTkrs) {
                var b = numStocks[ptype] / basketSize;
                
                if(b < basketSizeFactor)
                    basketSizeFactor = b;
            }
            
            //when used portfolio will be in some cash when not enough stocks can be found that match criteria rather than putting all money into a few stocks
            //console.log('basket size factor: ', basketSizeFactor);
            for(var ptype in orderTkrs) {
                var indLen = indicators[ptype].length;

        		for(var i = 0; i < numStocks[ptype]; i++) {
        		    var sym = orderTkrs[ptype][i];
        			var tkr = currPrices[sym];
                    var currPosSize = posSize[ptype] * basketSizeFactor, currStartCap = startCap[ptype];
    
                    if(weighted)
                        currPosSize = posWeight[ptype][i] * currStartCap * settings.leverage[ptype] * basketSizeFactor;
    				var price = tkr.price;
    				var resVals = [], tradeSize, actualTradeSize;
                    
    				var shares = parseInt(Math.floor(currPosSize / price)), actualShares;
				    tradeSize = shares * price;
				    
				    if(keepBasketShares[sym]) {
    				    actualShares = Math.abs((shares * (ptype == 'short' ? -1 : 1)) - (keepBasketShares[sym].shares * (ptype == 'short' ? -1 : 1)));
				        actualTradeSize = actualShares * price;
				    }
				    else {
				        actualTradeSize = tradeSize;
				        actualShares = shares;
				    }
    				    
                    friction = getFriction(actualShares, actualTradeSize);
                    totFriction += friction;
                    capt -= (tradeSize * (ptype == 'short' ? -1 : 1)) + friction;

    				if(indLen) {
    					for(var j = 0, cnt = indLen; j < cnt; j++) {
    					    if(!indicators[ptype][j].isPrice) {
        					    if(results.indicators[ptype][j])
        						    resVals.push(u.round(results.indicators[ptype][j]['all'][sym], 4));
        						else
        						    resVals.push(u.round(indicatorResults[ptype][j][sym], 4));
    					    }
    					}
    				}
    				
                    //console.log(orderTkrs[ptype][i], currPosSize);
    				addTrade(sym, shares, price, null, tkr.mktcap, tkr.sector, (ptype == 'short' ? 1 : 0), resVals);
    				
    				basket[sym] = { price:price, shares:shares, short:(ptype == 'short' ? 1 : 0), mktCap:tkr.mktcap, sector:tkr.sector, date:tradeDate };
        		}
            }
            
            console.log('Equity:', prevCapt, 'Capital Left:', capt, totFriction);
            
    		logTrades();
    		nextDay();
        }
	}
	
	function exitBasketShares(tkr, inNewBasket) {
	    var tradeSize, divSize, friction;
	    var data = getCurrentPrice(tkr, basket);
	    var shares = basket[tkr].shares * (basket[tkr].short ? -1 : 1);
	    
        tradeSize = shares * data.price;
        divSize = shares * data.div;
        
        friction = inNewBasket ? 0 : getFriction(Math.abs(shares), Math.abs(tradeSize));
        totFriction += friction;
		capt += divSize + tradeSize - friction;
        
		addTrade(tkr, Math.abs(shares), data.price, basket[tkr].price, data.mktCap, data.sector, basket[tkr].short, null, data.div);
	}
	
	function processQuintiles(tkrs) {
	    var baskets = basketQ;
	    
	    for(var i = 0, blen = baskets.length; i < blen; i++) {
            var bskt = baskets[i];
           
    		for(var tkr in bskt) {
    			var shares = bskt[tkr].shares;
    			var tradeSize, divSize;
                var data = getCurrentPrice(tkr, bskt);

                tradeSize = shares * data.price;
                divSize = shares * data.div;
                
                captQ[i] += (tradeSize + divSize) * (bskt[tkr].short ? -1 : 1);
    		}
        }
        
        basketQ = [];
        for(i = 0; i < quintiles; i++) {
            basketQ.push({});
        }
        
        if(tkrs) {
            //process long tickers for quintile analysis
            var tkrsLen = { long:tkrs.long.length, short:tkrs.short.length }
            var sPerQ = Math.floor(tkrsLen.long / quintiles);
            var counter = 0, currQ = 0;
            
            if(sPerQ > 0) { 
                var currPosSize = captQ[currQ] / sPerQ, currStartCap = captQ[currQ];
                //console.log('Quintile Capital: ' + captQ, 'Stocks Per Q: ' + sPerQ);
                //console.log('quintile ' + currQ + ' pos size: ' + currPosSize);
                
                for(var i = 0; i < tkrsLen.long; i++) {  
                    if(counter >= sPerQ) {
                        counter = 0;
                        currQ++;
                        
                        if(currQ >= quintiles)
                            break; //may have a few stocks leftover so just ignore them
                        
                        currPosSize = captQ[currQ] / sPerQ;
                        currStartCap = captQ[currQ];
                    }
                    
                    var tkr = currPrices[tkrs.long[i]];
    				var shares = parseInt(Math.floor(currPosSize / tkr.price));
    				basketQ[currQ][tkr.ticker] = { shares:shares, short:0, price:tkr.price };
                    captQ[currQ] -= shares * tkr.price;
                    
                    counter++;
                }
            }
        }
	}

    function processPositionExits() {
        var date = parseInt(siDate);
        var allInds = [], indTypes = [], tradesMade = false, goneFlat = false;

        //find indicators with an exit rule
        for(var ptype in indicators) {
            for(var i = 0, cnt = indicators[ptype].length; i < cnt; i++) {
                if(indicators[ptype][i].exitType == 1) {
                    allInds.push(indicators[ptype][i]);
                    indTypes.push({ ptype:ptype, index:i });
                }
            }
        }
        
        if(allInds.length > 0 || settings.stopLoss > 0 || settings.posStopLoss > 0) {
            var tickers = [], divPrices = {};
            for(var tkr in basket) {
                if(basket[tkr].shares > 0) {
                    tickers.push(tkr);
                    divPrices[tkr] = 0; //initialize all dividends to 0
                }
    		}
            
            if(tickers.length == 0) {
                console.log('already stopped out');
                finish();
                return;
            }
            
            var pricingTbl = rebalanceDaily ? 'tech_d' : 'tickers';
            
            db.mongof.collection(pricingTbl, function(error, collection) {
    			collection.find({"date":date, ticker:{ $in:tickers }}, { ticker:1, mktcap:1, sector:1, price:1, split_date:1, split_fact:1, dvp:1, dvx:1, dvt:1 }).toArray(function(err, results) {
                    //account for splits
                    var prices = {};
                    basketPrices = {}; //save reference to most recent basket price for strategy processing
                    
                    for(var i = 0, cnt = results.length; i < cnt; i++) {
                        var result = results[i];
                        basketPrices[result.ticker] = result.price;
                        
                        if(result.split_date != null && result.split_fact != null && u.parseDate(basket[result.ticker].date, 3) < result.split_date)
                    	    result.price = result.price * result.split_fact;
                        
                        if(priceError(result.ticker, result.price, basket[result.ticker].price))
                            result.price = basket[result.ticker].price;
                        
                        prices[result.ticker] = result;
                        
                        //dividends
                        //if(dividends[result.ticker] && dividends[result.ticker].type == 'Cash')
    				       // divPrices[result.ticker] = dividends[result.ticker].price;
    				        
    				    if(result.dvp && result.dvt == 'Cash' && basket[result.ticker].date < result.dvx)
    					    divPrices[result.ticker] = result.dvp;
    					    
    					//console.log(divPrices);
                    }
                    
                    //portfolio stop loss
                    if(settings.stopLoss > 0) {
                        var stopCapt = capt;
                        
                        for(var tkr in basket) {
                            stopCapt += basket[tkr].shares * (prices[tkr] ? prices[tkr].price : basket[tkr].price) * (basket[tkr].short ? -1 : 1);
                        }

                        if((prevCapt - stopCapt) / prevCapt > (settings.stopLoss / 100)) {
                            console.log('going flat', 'portfolio stop loss:', prevCapt, stopCapt);
                            
                            //stopped out of portfolio
                            for(var tkr in basket) {
                                var bskTkr = basket[tkr];
                                var result = prices[tkr] ? prices[tkr] : { price:bskTkr.price };
                                var tradeSize = bskTkr.shares * result.price;
                                var divSize = bskTkr.shares * divPrices[tkr];
                                var friction = getFriction(bskTkr.shares, tradeSize);
                                totFriction += friction;
                                capt += ((tradeSize + divSize) * (bskTkr.short ? -1 : 1)) - friction;
                                                
                                addTrade(tkr, bskTkr.shares, result.price, bskTkr.price, result.mktcap, result.sector, bskTkr.short, null, divPrices[tkr]);
                            }
                                       
                            goneFlat = true;
                            basket = {};
                            tradesMade = true;
                        }
                    }
                    
                    //position stop loss
                    if(!goneFlat && settings.posStopLoss > 0) {
                        for(var tkr in basket) {
                            if(prices[tkr]) {
                                var bskTkr = basket[tkr];
                                var chng = (bskTkr.price - prices[tkr].price) * (bskTkr.short ? -1 : 1);
                                
                                if(chng / basket[tkr].price > (settings.posStopLoss / 100)) {
                                    console.log('stop loss:', tkr, bskTkr.price, prices[tkr].price, bskTkr.short);
                                    var result = prices[tkr];
                                    var tradeSize = bskTkr.shares * result.price;
                                    var divSize = bskTkr.shares * divPrices[tkr];
                                    var friction = getFriction(bskTkr.shares, tradeSize);
                                    totFriction += friction;
                                    capt += ((tradeSize + divSize) * (bskTkr.short ? -1 : 1)) - friction;
                                                
                                    addTrade(tkr, bskTkr.shares, result.price, bskTkr.price, result.mktcap, result.sector, bskTkr.short, null, divPrices[tkr]);
                                    stoppedOut[tkr] = 1;
                                    
                                    delete basket[tkr];
                                    tradesMade = true;
                                }
                            }
                        }
                    }
    
                    //indicator stop loss
                    if(!goneFlat && allInds.length > 0) {
                        (new Calculation()).cache(allInds, date, function(calcCache, allCacheKeys) {
                            for(var j = 0, len = allInds.length; j < len; j++) {
                                var exitOp = allInds[j].exitOp, exitVal = allInds[j].exit, ptype = indTypes[j].ptype;
                            	var calc = (new Calculation()).init(allInds[j], allInds[j].allowNeg);
                            	calc.addValue("allCacheKeys", allCacheKeys);
                                var vals = calc.calculate(null, calcCache);
                                //var vals = calc.calculate(date, calcCache);

                				if(allInds[j].aggrType != 'val') {
                                    vals = calc.aggregate(allInds[j].aggrSpan > 0 ? resultCache : sresultCache, 'indicators', ptype, indTypes[j].index, vals);
                                }
                                
                                for(var i = 0, cnt = results.length; i < cnt; i++) {
                                    var result = results[i];
                                    var tkr = result.ticker;
                                    var bskTkr = basket[tkr];
              
                                    if(bskTkr && ((!bskTkr.short && ptype == 'long') || (bskTkr.short && ptype == 'short'))) {
                                        if(u.validValue(vals[tkr]) && (
                                            (exitOp == 1 && vals[tkr] < exitVal) || (exitOp == 2 && vals[tkr] > exitVal) ||
                                            (exitOp == 3 && vals[tkr] <= exitVal) || (exitOp == 4 && vals[tkr] >= exitVal)
                                            )) 
                                        {   
                                            tradesMade = true;
                                            
                                            var exitSize = 100; //50%
                                            var sharesClosed = Math.floor(bskTkr.shares * exitSize / 100);
                                            
                                            var tradeSize = sharesClosed * result.price;
                                            var divSize = sharesClosed * divPrices[tkr];
                                            var friction = getFriction(sharesClosed, tradeSize);
                                            totFriction += friction;
                            		        capt += ((tradeSize + divSize) * (bskTkr.short ? -1 : 1)) - friction;
                                            
                                            addTrade(tkr, sharesClosed, result.price, bskTkr.price, result.mktcap, result.sector, bskTkr.short, null, divPrices[tkr]);
                                            
                                            if(exitSize == 100)
                                                delete basket[tkr];
                                            else
                                                basket[tkr].shares = bskTkr.shares - sharesClosed;
                                            
                                            console.log(date, j + ": " + (bskTkr.short ? "Short" : "Long") + " Stop Indicator:", vals[tkr], tkr, 'Open: ' + bskTkr.price, "Close: " + result.price);
                                        }
                                    }
                                }  
                			}
                            
                            finish();
                		}, tickers, rebalanceDaily ? [6] : null);
                    }
                    else
                        finish();
    			});
    		});
        }
        else
            finish();
            
        function finish() {
            if(tradesMade) {
                logTrades(true);
                
                if(goneFlat) //stopped out of entire portfolio so wait until new rebalance period to make new trades
                    executeAndLogCapital();
                else {
                    //find new positions with available capital
                    console.log('replacing', date)
                    if(rebalanceDaily)
                        dailyExecute();
                    else
                        loadTickers(siDate, execute);
                }
            }
            else if(rebalanceDaily) {
                //daily rebalancing will only ever get in here if the day is mid-week, get data and go to next day
                dailyExecute(nextDay);
            }
            else {
                //if(basketSize) think about adding a logic step here to fill basket if it isn't already
                if(exposure.long.length > 0)
                    executeAndSetExposure();
                else
                    executeAndLogCapital();
            }
        }
    }
    
    function processExposure() {
        var expLongAdj = 1, expShortAdj = 1;
        
        for(var i = 0, len = exposure.long.length; i < len; i++) {
			for(var key in results.exposure.long[i]) {
				var exp = exposure.long[i];
                var expVal = results.exposure.long[i][key];
                console.log("Exp Value: " + expVal);
                    
                if(u.isNumber(expVal)) {
					if((exp.threshOp == 1 && expVal < exp.thresh) || (exp.threshOp == 2 && expVal > exp.thresh) ||
					   (exp.threshOp == 3 && expVal <= exp.thresh) || (exp.threshOp == 4 && expVal >= exp.thresh)
					  ) 
					{
						expLongAdj = expLongAdj * exp.exp / 100;
                        expShortAdj = expShortAdj * exp.expSh / 100;
					}
				}

				//should only be one but break just in case
				break;
			}
		}
		
		return { long:expLongAdj, short:expShortAdj };
    }
    
    function executeAndSetExposure() {
        loadTickers(siDate, function() {
            execute(function() {
                processBasket({ long:[], short:[] });
            }, logCapital ? null : exposure.long, logCapital ? false : true);
        });
    }
    
    function executeAndLogCapital() {
        if(logCapital) {
            loadTickers(siDate, function() {
                execute(function() {
                    logCurrentCapital();
                    nextDay();
                });
            });
        }
        else
            nextDay();
    }
    
    function logCurrentCapital() {
        var date = startDate.format();
        var prices = {}, div = {}, currCapt = capt;
        
        for(var tkr in basket) {
            var data = getCurrentPrice(tkr, basket);
    		currCapt += basket[tkr].shares * (data.price + data.div) * (basket[tkr].short ? -1 : 1);
        }
        
        log({ date:startDate.getTime(), capital:u.round(currCapt, 2), status:1 }, "_cp");
            
        return currCapt;
    }
    
    function getCurrentPrice(tkr, bskt) {
        var data = { div:0 };
        
        if(currPrices[tkr]) {
			if(splitPrices[tkr])
				data.price = splitPrices[tkr];
			else {
				data.price = currPrices[tkr].price;
			        
				if(dividends[tkr] && dividends[tkr].type == 'Cash') {
			        data.div = dividends[tkr].price;
				    //console.log('dividend', tkr, div);
				}
            }
            
            if(priceError(tkr, data.price, bskt[tkr].price))
			    data.price = bskt[tkr].price;
			        
			data.mktCap = currPrices[tkr].mktcap;
			data.sector = currPrices[tkr].sector;
		}
		else {
		    //ticker no longer exists, so check prev / ignore trade
			data.price = bskt[tkr].price;
			data.mktCap = bskt[tkr].mktCap;
			data.sector = bskt[tkr].sector;
		}
		
		return data;
    }
    
    function isExcluded(tkr, ptype) {
        var tkrExcl = false;
        var indTypeLen = indicators[ptype].length;
        var allInds = indicators[ptype].concat(exclusions);       
        var indResults = results.indicators[ptype].concat(results.exclusions);
        
        //first check for a specific ticker exclusion
        if(tkr.trim().indexOf(' ') > 0 || stoppedOut[tkr])
            return true;
            
        if(!settings.universeTkrs.incl && settings.universeTkrs.tkrs.length > 0 && u.inArray(tkr, settings.universeTkrs.tkrs))
            return true;
        
		for(var i = 0, indLen = allInds.length; i < indLen; i++) {
            if(tkrExcl)
                break;
                
			var ind = allInds[i];

            if(ind.exclType != -1) {
                switch(ind.exclType) {
                    case 1:
                        var val = indResults[i]['all'][tkr];
                        
                        if(u.validValue(val) && (
                            (ind.exclOp == 1 && val < ind.excl) || (ind.exclOp == 2 && val > ind.excl) ||
                            (ind.exclOp == 3 && val <= ind.excl) || (ind.exclOp == 4 && val >= ind.excl)
                            ))
                            tkrExcl = excludeTicker(tkr, i < indTypeLen ? i : i - indTypeLen, i < indTypeLen ? ptype : null);
                        
                        break;
                    case 0:
                        //percent rank
                        var rank = rankByInd.indicators[ptype][i][tkr];
                        if(rank && (
                            (ind.exclOp == 1 && rank < ind.excl) || (ind.exclOp == 2 && rank > ind.excl) ||
                            (ind.exclOp == 3 && rank <= ind.excl) || (ind.exclOp == 4 && rank >= ind.excl)
                            ))
                            tkrExcl = excludeTicker(tkr, i < indTypeLen ? i : i - indTypeLen, i < indTypeLen ? ptype : null);
                        
                        //var val = indResults[i]['all'][tkr]; //don't need this just for logging purposes
                        break;
                }
                
                //console.log(i, tkr, val, ind.excl, tkrExcl);
            }
		}

        return tkrExcl;
    }
    
    function getFriction(shares, tradeSize) {
        if(settings.frictionType == 1) { //IB Flat Rate
            var friction = shares * .005;
            
            if(friction < 1)
                friction = 1;
            else if(friction > tradeSize * .005)
                friction = tradeSize * .005;
                
            //console.log(shares, tradeSize, friction);
            return friction;
        }
        else if(settings.friction > 0)
            return tradeSize * settings.friction;
        else
            return 0;
    }
    
    function volatility(orderTkrs, callback) {
        var tickers = [];
        
        for(var ptype in orderTkrs) {
            for(var i = 0, cnt = orderTkrs[ptype].length; i < cnt; i++) {
                tickers.push(orderTkrs[ptype][i]);
    		}
        }            
        
        var date = parseInt(siDate);
        //console.log(date, tickers);
        
        db.mongof.collection('tech', function(error, collection) {
			collection.find({"date":date, ticker:{ $in:tickers }}, { ticker:1, vol10:1, volDS10:1, vol20:1, volDS20:1, vol126:1, volDS126:1 }).toArray(function(err, results) {
                var vols = {};
                for(var i = 0, cnt = results.length; i < cnt; i++) {
                    vols[results[i].ticker] = results[i];
                }
                
                //console.log('Volatility: ', vols);
                callback(vols);
			});
        });
    }
    
    function minCorrelation(orderTkrs, callback) {
        var date = parseInt(siDate);
        var date1 = u.parseDate(siDate, 3);
        //date1.setFullYear(date1.getFullYear() - 1);
        date1.setMonth(date1.getMonth() - 6);
        date1 = date1.format();

        var tkrPrices = {};
        var numTkrs = 0;
        
        for(var ptype in orderTkrs) {
            tkrPrices[ptype] = {};
            numTkrs += orderTkrs[ptype].length;
            
            for(var i = 0, len = orderTkrs[ptype].length; i < len; i++) {
                getPrices(orderTkrs[ptype][i], ptype);
            }
            
            function getPrices(tkr, ptype) {
                db.mongoPricing.collection(tkr.substring(0, 1).toUpperCase(), function(error, collection) {
                    collection.find({ ticker:tkr, date:{ $gte:date1, $lte:date } }, { ticker:1, adjClose:1, date:1 }).sort({ date:1 }, function(err, cursor) {
            		    cursor.toArray(function(err, prices) {
                            //console.log(tkr, prices.length);
                            if(prices != null) {
                                var prcLen = prices.length;
                                
                                if(prcLen > 0) {
                                    tkrPrices[ptype][tkr] = [];
                                    
                                    for(var j = 0; j < prcLen; j++) {
                                        var price = prices[j];
                                        tkrPrices[ptype][tkr].push({ date:price.date, val:price.adjClose });
                            		}
                                    
                                    tkrPrices[ptype][tkr] = tkrPrices[ptype][tkr].percentChange();
                                }
                            }
                            
                            if(--numTkrs == 0) {
                                var weights = {};
                                for(var pt in tkrPrices)
                                    weights[pt] = Stats.minCorrAlgo(tkrPrices[pt]);
                                
                                callback(weights);
                            }
            			});
                    });
        		});
            }
        }
    }
	
	function finish() {
	    processQuintiles();

        for(var tkr in basket) {
            exitBasketShares(tkr);
        }
		
		basket = {};
        logTrades(true);

		var captRnd = u.round(capt, 2);
		log({ date:startDate.getTime(), capital:captRnd, capitalQ:captQ, status:0, excl:exclByInd, friction:u.round(totFriction, 2) }, "_cp");
		
		var ret = (capt - initCapt) / initCapt;
		var cagr = Math.pow(capt / initCapt, 1.0 / (endDate.getFullYear() - initYear)) - 1;
		console.log(u.sprintf("Total Capital %s", captRnd));
		console.log(u.sprintf("Total Return %s, CAGR %s, Friction %s, I Cache Time %s, T Cache Time %s, Code Time %s", ret * 100, cagr * 100, totFriction, totCacheTime / 1000, totTickerTime / 1000, totCodeTime / 1000));
		console.log("Execution Time: " + ((new Date()).getTime() - startTime) / 1000);
        
        //cache.close();
        process.exit(0);
	}
    
    function priceError(tkr, price, prevPrice, noRebalanceFactor) {
        var priceGainError = 3, priceLossError = 4;
        
        if(!noRebalanceFactor) {
            priceGainError *= settings.rebalance;
            priceLossError *= settings.rebalance;
        }
        
        if(price / prevPrice > priceGainError || prevPrice / price > priceLossError) { 
            //very unlikely company went up 3 times or down 75% per month so price screwed up or ticker was changed
			console.log(siDate, tkr + " price out of range warning: " + price + " - " + prevPrice);
            return true;
        }
        else
            return false;
    }
	
	function addTrade(tkr, shares, price, pricep, mktCap, sector, short, values, div) {
	    //if(pricep) { console.log(short ? 'Buying' : 'Selling', tkr) }
	    //else { console.log(short ? 'Selling' : 'Buying', tkr) }
		var data = { ticker:tkr, shares:shares, price:parseFloat(price), short:short };
		
		if(mktCap != null) {
		    data.mktcap = parseFloat(mktCap);
		    data.sector = sector;
		}
		
        if(pricep != null)
    		data.pricep = parseFloat(pricep);
            
		if(values)
			data.values = values;
     
        if(div)
    		data.div = parseFloat(div);
		
		trades.push(data);
	}
	
	function logTrades(close) {
		if(trades.length > 0 || (!close && (isScreen || userStrategy))) {
		    var data = { id:id, date:startDate.getTime(), trades:trades, close:(close ? 1 : 0) };
		    
		    if(userStrategy) {
		        data.capt = capt;
		        data.basket = {};
		        for(var tkr in basket) {
		            data.basket[tkr.replace(".", "-")] = basket[tkr];
		        }
		    }
		    
			log(data, "_tr");
			trades = [];
		}
	}
	
	function log(data, ext) {
	    var tbl = userStrategy ? 'user_stgy' : 'log_bt';
		data.id = id;
		
		if(!settings.grpscreen) { //industry screen
    		db.mongo.collection(tbl + ext, function(error, collection) {
    			collection.insert(data);
    		});
		}
        
        if(!userStrategy)
            process.send({ event:ext, data:data });
	}
}
