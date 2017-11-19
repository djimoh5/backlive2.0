require("../../js/include/psmathstats.js");
require("../../js/lib/jstat-1.0.0.js");
require("../../js/stats.js");

Backtest = function() {
    var id;
    var isScreen = false;
	var basket = {}, basketExposure = { long:1, short: 1 }; 
	var indicators = {}, exposure = {}, exclusions = [], allIndicators = [];
	var results = {}, indicatorResults = {}, rankByInd = {}, exclByInd = {};
	var siDate = 0, prevDate = 0, cacheDateArr = {};
	var currSeason, prevSeason, offSeason = [], seasonStart, seasonEnd;
	var lastGameResults = {}, gameResults = {};

    var cacheDates = [];
	var initYear;
	var initCapt = 100000;
	var capt = initCapt, prevCapt, bankCapt = 0;
	var basketSize;

	var startDate, endDate, backtestStartDate, indicators;
	var hasIndWeights = { long:false, short:false };
	var startTime;
	var resultCache = {};
	var lastCalcCache, lastCacheKeys;
    //var cache = new Cache();
	var cacheMax = 365;
	var relRange = 1; //YoY
	
	var trades = [];
	var settings;
    var totFriction = 0;
    var totCacheTime = 0, totTickerTime = 0, totCodeTime = 0;
    
    var userStrategy;
    
	this.run = function(backtestId, params, strategy) {
		settings = params;
		userStrategy = strategy;
		
		console.log(settings);
		
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

        if(settings.initCapt) {
            capt = prevCapt = initCapt = settings.initCapt;
        }

		if(indicators.long.length > 0 || indicators.short.length > 0 || exposure.long.length > 0) {
		    indicators.price = [];
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'vs_id']], sortDesc:-1, noCalc:true });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'score']], sortDesc:-1 });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'spr_o']], sortDesc:-1, allowNeg:true });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'spr_c']], sortDesc:-1, allowNeg:true });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'tot_o']], sortDesc:-1, allowNeg:true });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'tot_c']], sortDesc:-1, allowNeg:true });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'ml_o']], sortDesc:-1, allowNeg:true });
		    indicators.price.push({ aggrType:'val', ops:[], vars:[[102, 'ml_c']], sortDesc:-1, allowNeg:true });
		    allIndicators = indicators.long.concat(indicators.short, exposure.long, exclusions, indicators.price);
		    
		    for(var ptype in indicators) {
		        for(var i = 0, len = indicators[ptype].length; i < len; i++) {
                    if(indicators[ptype][i].weight > 0) {
                        hasIndWeights[ptype] = true;
                        break;
                    }
		        }
		    }
		    
		    //universe settings
            setUniverse();
		    
            var currYear, startYear = parseInt(start.substring(0, 4)) - cacheMax - 1;
            //add some pre-caching for aggregates by game and num of days logic here
			
			startDate = u.parseDate(start, 4);
			endDate = u.parseDate(end, 4);

			initYear = startDate.getFullYear();
            console.log(startDate.toDateString(), endDate.toDateString());
			
            startBacktest();
		}
        else
            process.exit(0);
	}
	
	function setUniverse() {
        switch(settings.universeType) {
            case 'nba': offSeason = [7, 8, 9]; seasonStart = '1001'; seasonEnd = '0701';
                break;
            case 'mlb': offSeason = [11, 12, 1, 2]; seasonStart = '0301'; seasonEnd = '1101';
                break;
        }
    }
    
    function startBacktest() {
        if(userStrategy) {
            basket = userStrategy.basket;

            if(userStrategy.capt)
                capt = userStrategy.capt;
        }
        
        var season = getCurrentSeason(startDate.format());
        backtestStartDate = new Date(startDate.getTime());
        
        startDate = u.parseDate(season + seasonStart, 4);
        console.log('season start date', season, startDate, backtestStartDate);
        
        startDate.setDate(startDate.getDate() - 1); //set to yesterday since next day increments by 1 day
        nextDay();
    }
    
    function getCurrentSeason(date) {
        var isPrevYear;
        date += "";
        
        if(settings.universeType == 'mlb') {
		    isPrevYear = false;
		}
		else {
		    isPrevYear = parseInt(date) < parseInt(date.substring(0, 4) + seasonEnd);
		}
		
		return parseInt(date.substring(0, 4)) - (isPrevYear ? 1 : 0);
    }
	
	function nextDay() {
		startDate.setDate(startDate.getDate() + 1);
		prevDate = siDate;
		siDate = startDate.format() + "";
		
		if(currSeason) {
		    prevSeason = currSeason;
		}

		lastGameResults = gameResults;

		if(startDate < endDate || (isScreen && startDate.getTime() == endDate.getTime())) {
		    if(u.inArray(parseInt(siDate.substring(4, 6)), offSeason)) {
    		    nextDay();
    		    return;
    		}
    		
    		currSeason = getCurrentSeason(siDate);
            execute(startDate < backtestStartDate ? nextDay : null);
		}
		else if(startDate.getTime() == endDate.getTime()) {
			finish();
		}
		else if(userStrategy)
		    userStrategy.callback(basket);//, currPrices, basketPrices);
		else
			process.exit(0); //stock screen ran or strategy update;
	}
    
	function execute(optionalCallback, plIndicators, expOnly) {
		results = { indicators:{ long:[], short:[], price:[] }, exposure:{ long:[], short:[] }, exclusions:[] };
        rankByInd = { indicators:{ long:[], short:[], price:[] }, exclusions:[] };
        exclByInd = { indicators:{ long:[], short:[], price:[] }, exclusions:[] };
        gameResults = {};
		
		//backtest values caching
        var updateCache = true, cacheIndex = {};

        if(prevSeason && currSeason == prevSeason) {
            executeCache(lastCalcCache, lastCacheKeys); //still in same season so just process from cache
        }
	    else {
            var sCacheTime = (new Date()).getTime();

            (new Calculation()).cache(plIndicators ? plIndicators : allIndicators, [currSeason], function(calcCache, allCacheKeys) {
    		    var cacheTime = (new Date()).getTime() - sCacheTime;
                totCacheTime += cacheTime;

                if(!expOnly)
                    lastCalcCache = calcCache;
                
                lastCacheKeys = allCacheKeys;
                executeCache(calcCache, allCacheKeys);
    	    }, null, null, { dateField:'season', addtlFields:['starts'], tablePrefix:settings.universeType });
	    }
	    
		function executeCache(calcCache, allCacheKeys) {
            var sCacheTime = (new Date()).getTime(); //start for code time
            var indVals = { long:[], short:[], price:[] }, vals;
            
            if(!expOnly) {
                //exclusions
                /*for(var i = 0; i < exclusions.length; i++) {
        			var calc = (new Calculation()).init(exclusions[i], exclusions[i].allowNeg);
                    calc.addValue("allCacheKeys", allCacheKeys);
                    vals = calc.calculate(siDate, calcCache);
    
                    results.exclusions[i] = { 'all':vals };
    			}*/
    			
    			var ptypes = ['price', 'long', 'short'];
                
                //indicators
                for(var p = 0; p < 3; p++) {
                    var ptype = ptypes[p];
                    
        			for(var i = 0, len = indicators[ptype].length; i < len; i++) {
        			    if(plIndicators && indicators[ptype][i].aggrType == 'val')
        			        continue; //pre-caching and indicator isn't in cache list
        			    
        				var calc = (new Calculation()).init(indicators[ptype][i], indicators[ptype][i].allowNeg, indicators[ptype][i].noCalc);
        				calc.addValue("allCacheKeys", allCacheKeys);
                        vals = calc.calculate(siDate, calcCache);
                        //console.log(ptype, vals);
                        
                        results.indicators[ptype][i] = { 'all':{} };
                        rankByInd.indicators[ptype][i] = {};
        
                	    //cache past values so we can use them in aggregates and relative restrictions
                        if(indicators[ptype][i].aggrType != 'val') {
                            var aggrVals;
                            
                            if(!optionalCallback) { //get aggregate before updating cache since it should not contain current date
                                aggrVals = calc.aggregateBy(resultCache, 'indicators', ptype, i, vals, gameResults);
                            }
                            
            		        for(var tkr in vals) {
            		            var tm = indicators[ptype][i].player ? tkr.split('_')[0] : tkr;
            		            
            		            if(!resultCache[tkr])
            		                resultCache[tkr] = [];
            		            
            		            if(!cacheIndex[tkr]) {
                		            if(resultCache[tkr].length >= cacheMax)
                		                resultCache[tkr].shift();
                		               
                		            resultCache[tkr].push({ indicators:{ long:[], short:[], price:[] }, season:currSeason, date:siDate, vs:gameResults[tm] ? gameResults[tm].vs_id : null });
                		            cacheIndex[tkr] = resultCache[tkr].length;
            		            }
            		                
            		            resultCache[tkr][cacheIndex[tkr] - 1].indicators[ptype][i] = vals[tkr];
            		        }
            		        
            		        if(aggrVals) { 
            		            vals = aggrVals;
                                //console.log(siDate, i, vals, aggrVals)
            		        }
                        }
                        
                        indVals[ptype].push(vals);
        			}
        			
        			if(ptype == 'price') {
        			    for(var tkr in indVals['price'][0]) {
                            gameResults[tkr] = { vs_id:indVals[ptype][0][tkr], score:indVals[ptype][1][tkr], spr_o:indVals[ptype][2][tkr], spr_c:indVals[ptype][3][tkr], tot_o:indVals[ptype][4][tkr], tot_c:indVals[ptype][5][tkr], ml_o:indVals[ptype][6][tkr], ml_c:indVals[ptype][7][tkr] };
                        }
        			}
                }
            }
            
            //exposure
			/*for(var i = 0; i < exposure.long.length; i++) {
			    if(!expOnly && plIndicators && exposure.long[i].aggrType == 'val')
    			    continue; //pre-caching and indicator isn't in cache list
    			        
				var calc = (new Calculation()).init(exposure.long[i], exposure.long[i].allowNeg);
                calc.addValue("allCacheKeys", allCacheKeys);
                vals = calc.calculate(siDate, calcCache, null, marketTicker);
                results.exposure.long[i] = { 0:vals[0] };
                
                if(exposure.long[i].aggrType != 'val') {
                    if(updateCache)
                        resultCache[cacheMax].exposure.long[i] = vals;
                    
                    if(!optionalCallback || expOnly) {
                        var tmpVals = calc.aggregate(exposure.long[i].aggrSpan > 0 ? resultCache : sresultCache, 'exposure', 'long', i, vals);
                        if(tmpVals) vals = tmpVals;
                    }
                }
			}*/
			
            if(optionalCallback)
                optionalCallback();
            else {
                calculate(indVals);
            }
            
            totCodeTime += (new Date()).getTime() - sCacheTime;
		}
	}
	
	function calculate(indVals) {
	    var sectorAll = 'all', excluded = {}, ind;
	    
        for(var ptype in indVals) {
            if(ptype != 'price') {
                var indLen = indVals[ptype].length;
                
                for(var index = 0; index < indLen; index++) {
					ind = indicators[ptype][index];
					
					if(ind.player) {
						indVals[ptype][index] = convertToTeam(ind, indVals[ptype][index]);
						//console.log(indVals[ptype][index])
					}
					
                    for(var tkr in indVals[ptype][index]) {
                        var tkrExcl = false, val;
                        
                        if(!excluded[tkr]) {
                            if(gameResults[tkr] && gameResults[gameResults[tkr].vs_id]) {
                                switch(ind.valType) {
                                    case 1: val = indVals[ptype][index][tkr];
                                        break;
                                    case 2: val = indVals[ptype][index][gameResults[tkr].vs_id];
                                        break;
                                    case 3: 
                                        val = indVals[ptype][index][tkr] - indVals[ptype][index][gameResults[tkr].vs_id];
                                        if(!u.isNumber(val)) val = NO_VALUE;
                                        break;
    								case 4: 
    								    val = indVals[ptype][index][tkr] + indVals[ptype][index][gameResults[tkr].vs_id];
    								    if(!u.isNumber(val)) val = NO_VALUE;
    	                                break;
                                }
                            }
                            else
                                val = NO_VALUE;
                            
            				if(u.validValue(val)) {
                                results.indicators[ptype][index][sectorAll][tkr] = val;
            				} 
            				else if(ind.weight > 0 || ind.sortDesc == -1) //weight or no sort, must have value
                                tkrExcl = excludeTicker(tkr, index, ptype);
            
                            if(tkrExcl) {
                                excluded[tkr] = 1;
                                
                                if(index > 0) { //remove from all previous indicator results                                
                                    for(var i = index - 1; i >= 0; i--) {
                                        delete results.indicators[ptype][i][tkr];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
 
        indicatorResults = results.indicators;
    	processBasket({ long:percentRank(indicators.long, results.indicators.long, rankByInd.indicators.long, hasIndWeights.long), short:percentRank(indicators.short, results.indicators.short, rankByInd.indicators.short, hasIndWeights.short) });
    }

	function convertToTeam(ind, data) {
	    var players = {};
	    
	    function validPlayer(pdata) {
	        return ind.player == 'a' || (ind.player == 's' && pdata['starts']) || (ind.player == 'b' && !pdata['starts']);
	    }
	    
	    if(lastCalcCache[101]) {
    		var tm, teams = {}, cdata = {}, cache = lastCalcCache[101][siDate], keys, len;
    		
    		for(var tkr in data) {
    			tm = tkr.split('_')[0];

    			if(u.defined(cache[tkr]) && validPlayer(cache[tkr])) {
    			    if(!teams[tm]) {
        			    teams[tm] = {};
        			}
    			
    			    teams[tm][tkr] = data[tkr];
    			}
    		}
    		
    		for(tm in teams) {
    		    keys = u.sortKeysByValue(teams[tm], ind.playerSort);
    		    len = Math.min(ind.playerNum, keys.length)
    		    
    		    for(var i = 0; i < len; i++) {
    		        cdata[tm] = i == 0 ? teams[tm][keys[i]] : (cdata[tm] + teams[tm][keys[i]]);
    		    }
    		    
    		    cdata[tm] = cdata[tm] / len;
    		}
    		
    		return cdata;
	    }
	    else
	        return {};
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
        
        return u.sortKeysByValue(testData, true);
	}
	
	function processBasket(tkrs) {
	    var orderTkrs = { long:[], short:[] }, posWeight = { long:[], short:[] }, posSize = { long:[], short:[] };
		var tkrsLen = { long:tkrs.long.length, short:tkrs.short.length }, numStocks = { long:basketSize, short:basketSize };
		var usedTkrs = {}; 
		
		//get current exposure
		var expAdj = { long:1, short:1 };//processExposure();

        for(var tkr in basket) {
            exitBasketShares(tkr);
        }
        
		basket = {};
		logTrades(true);
	    
	    //bank capital
	    if(settings.profitPer && capt > prevCapt && capt > initCapt) {
	        var takeProfitAmt = u.round((capt - Math.max(prevCapt, initCapt)) * settings.profitPer / 100, 2);
	        bankCapt += takeProfitAmt;
	        capt -= takeProfitAmt;
	        //console.log('banking', takeProfitAmt, 'of profits - ', bankCapt);
	    }
	    
	    prevCapt = capt;
        var startCap = { long:prevCapt * expAdj.long, short:prevCapt * expAdj.short };
        
		//log current amount of capital, friction, and exposure
        log({ date:startDate.getTime(), capital:u.round(capt + bankCapt, 2), status:1, excl:exclByInd, friction:u.round(totFriction, 2), exp:{ l:expAdj.long, s:expAdj.short } }, "_cp");

        //now get tickers for portfolio
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
                    orderTkrs[ptype].push(tkr);
                    usedTkrs[tkr] = 1;
                    usedTkrs[gameResults[tkr].vs_id] = 1;
                }
            }
        }
        
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
        	    }
            }
            
            var weighted = posWeight.long.length > 0 || posWeight.short.length > 0;
            var basketSizeFactor = 1, tradeDate = startDate.format(), friction;
            
            for(var ptype in orderTkrs) {
                var b = numStocks[ptype] / basketSize;
                
                if(b < basketSizeFactor)
                    basketSizeFactor = b;
            }
            
            //when used portfolio will be in some cash when not enough stocks can be found that match criteria rather than putting all money into a few stocks
            for(var ptype in orderTkrs) {
                var indLen = indicators[ptype].length;

        		for(var i = 0; i < numStocks[ptype]; i++) {
        		    var sym = orderTkrs[ptype][i];
                    var currPosSize = posSize[ptype] * basketSizeFactor, currStartCap = startCap[ptype];
    
                    if(weighted)
                        currPosSize = posWeight[ptype][i] * currStartCap * settings.leverage[ptype] * basketSizeFactor;
    				var price = currPosSize;
    				var resVals = [], tradeSize, friction;
                    
    				var shares = 1;
				    tradeSize = shares * price;
    				    
                    friction = 0;//getFriction(shares, tradeSize);
                    totFriction += friction;
                    capt -= (tradeSize * (ptype == 'short' ? -1 : 1)) + friction;

    				if(indLen) {
    					for(var j = 0, cnt = indLen; j < cnt; j++) {
    					    if(results.indicators[ptype][j])
    						    resVals.push(u.round(results.indicators[ptype][j]['all'][sym], 4));
    						else
    						    resVals.push(u.round(indicatorResults[ptype][j][sym], 4));
    					}
    				}
    				
    				gameResults[sym].vscore = gameResults[gameResults[sym].vs_id].score;
    				addTrade(sym, shares, price, null, 0, 0, (ptype == 'short' ? 1 : 0), resVals, gameResults[sym]);
    				
    				basket[sym] = { price:price, shares:shares, short:(ptype == 'short' ? 1 : 0), mktCap:0, sector:0, date:tradeDate };
        		}
            }
            
            //console.log(siDate, 'Equity:', prevCapt, 'Capital Left:', capt, totFriction);
            
    		logTrades();
    		nextDay();
        }
	}
	
	function exitBasketShares(tkr, inNewBasket) {
	    var tradeSize, divSize, friction;
	    var data = getCurrentPrice(tkr, basket);
	    var shares = basket[tkr].shares * (basket[tkr].short ? -1 : 1);
	    
        tradeSize = shares * data.price;

        friction = inNewBasket ? 0 : getFriction(Math.abs(shares), Math.abs(tradeSize));
        totFriction += friction;
		capt += tradeSize - friction;
        
		addTrade(tkr, Math.abs(shares), data.price, basket[tkr].price, data.mktCap, data.sector, basket[tkr].short);
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
    
    function getCurrentPrice(tkr, bskt) {
        var data = { div:0, price:bskt[tkr].price };
        
        var tm = lastGameResults[tkr];
        var vs = lastGameResults[tm.vs_id];
        
        //console.log(siDate, tkr, tm.score, tm.spr_c, ' - ', tm.vs_id, vs.score, (tm.score + tm.spr_c) > vs.score, ' - ', tm.tot_c, (tm.score + vs.score) > tm.tot_c);
        
        if(u.defined(tm.score) && u.defined(vs.score)) {
			if(settings.betType == 1) {
			    if((tm.score + tm.spr_c) > vs.score)
	                data.price = bskt[tkr].price * 2;
	            else if((tm.score + tm.spr_c) < vs.score)
	                data.price = 0;
			}
			else if(settings.betType == 2) {
            	if((tm.score + vs.score) > tm.tot_c)
	                data.price = bskt[tkr].price * 2;
	            else if((tm.score + vs.score) < tm.tot_c)
	                data.price = 0;
			}
			else if(settings.betType == 3) {
                if(tm.score > vs.score) {
                    if(tm.ml_c > 0) {
                        data.price += data.price / 100 * tm.ml_c;
                    }
                    else if(tm.ml_c < 0) {
                        data.price += data.price / Math.abs(tm.ml_c) * 100;
                    }
                }
	            else if(tm.score < vs.score) 
	                data.price = 0;
            }
        }
            
		return data;
    }
    
    function isExcluded(tkr, ptype) {
        var tkrExcl = false;
        var indTypeLen = indicators[ptype].length;
        var allInds = indicators[ptype].concat(exclusions);       
        var indResults = results.indicators[ptype].concat(results.exclusions);
        
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
            }
            else if(ind.compare) {
                var val = indResults[i]['all'][tkr];
                var valCmp = indResults[i + 1]['all'][tkr];
                        
                if(!u.validValue(val) || !u.validValue(valCmp) || (
                    (ind.compare == 1 && val < valCmp) || (ind.compare == 2 && val > valCmp) ||
                    (ind.compare == 3 && val <= valCmp) || (ind.compare == 4 && val >= valCmp)
                )) {
                    tkrExcl = excludeTicker(tkr, i < indTypeLen ? i : i - indTypeLen, i < indTypeLen ? ptype : null);
                }
                
                break;
            }
		}

        return tkrExcl;
    }
    
    function getFriction(shares, tradeSize) {
        if(settings.friction > 0)
            return tradeSize * settings.friction;
        else
            return 0;
    }
	
	function finish() {
        for(var tkr in basket) {
            exitBasketShares(tkr);
        }
		
		basket = {};
        logTrades(true);

        capt += bankCapt;

		var captRnd = u.round(capt, 2);
		log({ date:startDate.getTime(), capital:captRnd, status:0, excl:exclByInd, friction:u.round(totFriction, 2) }, "_cp");
		
		var ret = (capt - initCapt) / initCapt;
		var cagr = Math.pow(capt / initCapt, 1.0 / (endDate.getFullYear() - initYear)) - 1;
		console.log(u.sprintf("Total Capital %s", captRnd));
		console.log(u.sprintf("Total Return %s, CAGR %s, Friction %s, I Cache Time %s, T Cache Time %s, Code Time %s", ret * 100, cagr * 100, totFriction, totCacheTime / 1000, totTickerTime / 1000, totCodeTime / 1000));
		console.log("Execution Time: " + ((new Date()).getTime() - startTime) / 1000);
        
        //cache.close();
        process.exit(0);
	}
	
	function addTrade(tkr, shares, price, pricep, mktCap, sector, short, values, game) {
		var data = { ticker:tkr, shares:shares, price:parseFloat(price), short:short };
		
		if(mktCap != null) {
		    data.mktcap = parseFloat(mktCap);
		    data.sector = sector;
		}
		
        if(pricep != null)
    		data.pricep = parseFloat(pricep);
            
		if(values)
			data.values = values;
     
        if(game)
    		data.game = game;
		
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
