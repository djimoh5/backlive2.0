Cache = {
	siDates:[],
	index:-1,
    model:require("../core/model/data.js").model,
    maxDate:null,
    etfs:null,
    
    denormField: function() {
        var sourceColl = process.argv[4];
        var targetColl = process.argv[5];
        var fieldName = process.argv[6];
        var updatedTkrs = 0, totalTkrs = 0;
        
        if(sourceColl && targetColl && fieldName) {
            Cache.getDates(function() {
                var query = { date:Cache.siDates[++Cache.index] };
                
                if(query.date) {
                    db.mongo.collection(sourceColl, function(error, collection) {
                        collection.find(query).toArray(function(err, results) {
                            totalTkrs = results.length;
                            console.log(query.date + ' updating ' + fieldName + ' ' + totalTkrs);
                            
                            for(var i = 0, cnt = results.length; i < cnt; i++) {
                                var result = results[i];
                                update(result.ticker, result.date, result[fieldName]);
        				    }
        				});
        			});
                }
                else
                    Cache.exit();
            }, false);
           
            function update(ticker, date, val) {
                db.mongo.collection(targetColl, function(error, collection) {
                    var setObj = {};
                    setObj[fieldName] = val;
                    collection.update({ ticker:ticker, date:date }, { $set:setObj }, function(err, result) {
                        if(err)
                            console.log(err)
                        else
                            updatedTkrs++;
                        
                        if(totalTkrs == updatedTkrs) {
                            console.log('updated tickers ' + updatedTkrs);
                             Cache.denormField();
                        }
                    });
                });
            }
        }
    },
	
    compress: function() {
        if(process.argv[4]) {
            var collName = process.argv[4];
            
            Cache.getDates(function() {
                var query = { date:Cache.siDates[++Cache.index] };
                
                if(query.date) { 
                    db.mongo.collection(collName, function(error, collection) {   
                        collection.find(query).toArray(function(err, results) {
                            var res = [];
                            for(var i = 0, cnt = results.length; i < cnt; i++) {
                                var result = results[i];
                                
                                if(collName == 'tickers') {
                                    if(result.ticker != null && result.price > 0 && result.mktcap != null && result.indus != '0721' && result.exchange != 'O') {
                                        if(collName == "tickers") {
                                            var isADR = result.adr == 1 || result.name.indexOf('ADR') >= 0;
    
                                            var tmp = { t:result.ticker, cid:result.cid, rid:result.rid, m:result.mktcap, p:result.price, dv:result.dps, s:result.sector, i:result.indus, x:result.exchange, 
                                                        sp:result.sp, dw:result.dow, s_d:result.split_date, s_f:result.split_fact };
                                            
                                            if(result.dvp) {
                                                tmp.dvp = result.dvp;
                                                tmp.dvx = result.dvx;
                                                tmp.dvt = result.dvt;
                                            }
                                            
                                            result = tmp;
                                            
                                            if(result.sp == 'NA')
                                                delete result.sp;
                                            if(result.dw == 'NA')
                                                delete result.dw;
                                            if(isADR)
                                                result.adr = 1;
                                        }
                                    
                                        res.push(result);
                                    }
                                }
                                else {
                                    delete result._id; delete result.date;
                                    res.push(result);
                                }
        				    }
                            
                            var doc = { date:query.date, data:res };

                            db.mongo.collection(collName + '_c', function(error, collc) {
                                collc.insert(doc, { safe:true }, function(err) {
                                    if(err)
                                        console.log(err);
                                    console.log(collName, query.date, 'insert complete');
                                    Cache.compress();
                                });
                            })
        				});          
        			});
                }
                else
                    Cache.exit();
            }, false);
        }
    },
    
    compressETF: function() {
        var collName = 'etf', dataCollName = "tech";
        
        Cache.getDates(function() {
            if(Cache.etfs)
                compress();
            else {
                db.mongo.collection(collName, function(error, collection) {
                    Cache.etfs = { obj:{}, arr:[] };
                    collection.find().toArray(function(err, results) {
                        for(var i = 0, len = results.length; i < len; i++) {
                            Cache.etfs.obj[results[i].ticker] = results[i];
                            Cache.etfs.arr.push(results[i].ticker);
                        }
                        
                        compress();
                    });
                });
            }
        }, false);
        
        function compress(etfs) {
            var query = { date:Cache.siDates[++Cache.index], ticker:{ $in:Cache.etfs.arr } };

            if(query.date) {
                Cache.getDividends(Cache.siDates[Cache.index], Cache.etfs.arr, function(dividends) {
                    db.mongo.collection(dataCollName, function(error, collection) { 
                        collection.find(query).toArray(function(err, results) {
                            //console.log(results.length);
                            
                            var res = [];
                            
                            for(var i = 0, cnt = results.length; i < cnt; i++) {
                                var result = results[i];
                                
                                if(result.price > 0) {
                                    var etf = Cache.etfs.obj[result.ticker];
                                    var tmp = { t:result.ticker, p:result.price, go:etf.geo, as:etf.asset };
                                    var div = dividends[result.ticker];

                                    if(div) {
                                        tmp.dvp = div.amt;
                                        tmp.dvx = div.adate;
                                        tmp.dvt = div.type;
                                    }
                                    
                                    res.push(tmp);    
                                }
        				    }
                            
                            var doc = { date:query.date, data:res };
    
                            db.mongo.collection(collName + '_c', function(error, collc) {
                                collc.insert(doc, { safe:true }, function(err) {
                                    if(err)
                                        console.log(err);
                                    console.log(collName, query.date, 'insert complete');
                                    Cache.compressETF();
                                });
                            })
        				});          
        			});
                });
            }
            else
                Cache.exit();
        }
    },
    
    getDividends: function(date, tkrs, callback) {
        db.mongo.collection('dividend', function(error, collection) {
            var query = { date:date, ticker:{ $in:tkrs } }
            collection.find(query, function(err, cursor) {
                var res = {};

                cursor.each(function(err, result) {
                    if(result == null)
                        callback(res);
                    else {
                        res[result.ticker] = result;
                    }
                });
            });
        });    
    },
    
    indices: function(oneDate) {
        var query = {};
        
        if(process.argv[4])
            query.sector = process.argv[4];
        else
            query.sp = '500';
            
        Cache.getDates(function() {
            var date;
        
            if(oneDate)
                date = oneDate;
            else
                date = Cache.siDates[++Cache.index];
            
            if(date) { 
                query.date = date;
                
                var mod = new Cache.model(['ratios', query], function(data, count) {
                    for(var key in data) {
                        if(key == 'snt') {
                            var mktcap = u.round(data[key].mktcap, 2); //data is changed to last key by the time we insert tickers
                            
                            db.mongo.collection('tickers', function(error, collection) {
                                collection.remove({ ticker:data[key].ticker, date:data[key].date }, function(err, result) {
                                    var ticker = { ticker:data[key].ticker, date:data[key].date, mktcap:mktcap, price:0, count:count };
                                    console.log(date + ' inserting: tickers');
                                    collection.insert(ticker, function(err) {});
                                });
                            });
                        }
                        
                        Cache.saveIndicies(date, key, data);
                    }
                    
                    if(!oneDate)
    				    Cache.indices();
                });
            }
            else {
                //console.log('done');
                Cache.exit();
            }
        });
    },
    
    saveIndicies: function(date, key, data) {
        db.mongo.collection(key, function(error, collection) {
            collection.remove({ ticker:data[key].ticker, date:data[key].date }, function(err,result) {
                console.log(date + ' inserting: ' + key);
	            collection.insert(data[key], function(err) {});
            });
        });
    },
    
    /*tickerAutocomplete: function() {
        Cache.getDates(function() {
            db.mongo.collection('tickers_ac', function(error, acCollection) {
                acCollection.remove({}, function(err, result) {
                    db.mongo.collection('tickers', function(error, collection) {   
                        collection.find({ date:Cache.siDates[0] }).toArray(function(err, results) {
                            for(var i = 0, cnt = results.length; i < cnt; i++) {
                                var result = results[i];
                                if(result.ticker != null && result.price > 0 && result.mktcap != null && result.indus != '0721') {
                                    acCollection.insert({ t:result.ticker, n:result.name }, { safe:true }, function(err) {
                                        if(err) console.log(err);
                                    });
                                }
                            }
                            
                            Cache.exit();
        				});          
        			});
                });
            });
        }, false);
    },*/
    
    /*technicals: function() {
        Cache.getDates(function() {
            var query = { date:Cache.siDates[++Cache.index] };
            
            if(query.date) {
                var per;
                
                if(query.date < 20040101) {
                    Cache.technicals();
                    return;
                }
                
                var per = query.date < 20040101 ? 12 : 52;
                
                db.mongo.collection('tickers_c', function(error, collection) {
                    collection.find(query).toArray(function(err, results) {
                        results = results[0].data;
        				for(var i = 0, cnt = results.length; i < cnt; i++) {
                            //loop through each ticker and get prices
                    		var result = results[i];
                            var date = u.parseDate(query.date + "", 3);
                            date.setDate(date.getDate() - 365);
                            
                            db.pricing.collection('pricing', function(error, collection) {
                                collection.find({ ticker:result.ticker, date:{ $gte:date.format(), $lte:query.date } }).toArray(function(err, prices) {
                        			for(var j = 0, prcLen = prices.length; j < prcLen; j++) {
                                        //compute technicals
                                		console.log(prices[j].ticker, prices[j].price);
                            		}
                    			});
                    		});
                			query:result.ticker;
                		}
        			});
        		});
            }
            else
                process.exit(0);
        }, true);
    },*/
    
	financials: function(data) {
		db.mysql.query("SELECT fdate FROM file_date WHERE week = ? ORDER BY fdate", [4], function(error, results, fields) {
			if(error) {
				console.log("Error selecting data: " + error.message);
				return;
			} else {
				for(var i = 0, cnt = results.length; i < cnt; i++) {
					result = results[i].fdate.toString();
					Cache.siDates.push(u.date(result.substring(0, 4), result.substring(4, 6) - 1, result.substring(6, 8)));
				}
				
				//next();
			}
		});
	},
    
    getDates: function(callback, all) {
        if(Cache.siDates.length == 0) {
            console.log('caching dates');
            u.getDates(function(results) {
				for(var i = (all ? 0 : results.length - 1), cnt = results.length; i < cnt; i++) {
					Cache.siDates.push(results[i]);
				}
                
                callback();
			}, -1);
        }
        else
            callback();
    },
	
	backtestFields: function() {
        u.getDates(function(results) {
            Cache.maxDate = results[results.length - 1];
            
    		//retrieve valid fields
    		db.mongo.collection('fields', function(error, collection) {
    			collection.remove({}, function(err, result) {
    				Cache.cacheFields(['is', 'Income Statement', 1], 1);
    				Cache.cacheFields(['bs', 'Balance Sheet', 2], 2);
    				Cache.cacheFields(['cf', 'Cashflow Statement', 3], 3);
    				Cache.cacheFields(['snt', 'Sentiment and Estimates', 4], 4);
    				Cache.cacheFields(['fi', 'Financial Indicators', 11], 5);
    				Cache.cacheFields(['shrt_intr', 'Short Interest', 8], 6);
    				Cache.cacheFields(['tech', 'Technicals', 6], 7);
                    Cache.cacheFields(['macro', 'FRED', 7], 8);
                    
                    //Cache.cacheFields(['mos', 'Proprietary', 5]);
                    //Cache.cacheFields(['is_gr', 'Growth Income Statement', 9]);
                    //Cache.cacheFields(['eurodo', 'Euro Dollar Futures', 101]);
    			});
    		});
        }, -1);
		
		/*db.mongo.collection('sectors', function(error, collection) {
			collection.remove({}, function(err, result) {
				db.mysql.query("SELECT mg_code, mg_desc FROM si_mgdsc", function(error, results, fields) {
					if(error)
						console.log("Error selecting data: " + error.message);
					else {
						console.log('caching sectors');
						for(var i = 0, cnt = results.length; i < cnt; i++) {
							db.mongo.collection('sectors', function(error, collection) {
								if(results[i].mg_code.toString().length == 2)
									collection.insert({ code:results[i].mg_code, descr:results[i].mg_desc }, function(err) {});
							});
						}
					}
				});
			});
		});*/
	},

	next: function() {
		if(++index < siDates.length) {
			var siDate = "" + Cache.siDates[index].getFullYear() + u.padMonth(Cache.siDates[index].getMonth() + 1) + u.padMonth(Cache.siDates[index].getDate());
			var date = parseInt(siDate);
			var tickers = {};
			
			console.log(Cache.siDates[index].toString());
			
			db.mongo.collection('tickers', function(error, collection) {
				collection.find({"fdate":date}, function(err, cursor) {
					cursor.toArray(function(err, results) {	
						if(err)
							console.log(err.message);
						else {
							for(var j = 0, cnt = results.length; j < cnt; j++) {
								var result = results[j];

								if(result.ticker != null && result.price != null && result.mktcap != null) {
									tickers[result.ticker] = 1;
								}
							}	
						}
						
						var tbl = 'si_cf';
						
						db.mongo.collection(tbl, function(error, collection) {
							collection.find({"year":date}, function(err, cursor) {
								cursor.toArray(function(err, results) {	
									if(err)
										console.log(err.message);
									else {
										console.log(results.length);
										
										for(var j = 0, cnt = results.length; j < cnt; j++) {
											var result = results[j];
											
											if(tickers[result.ticker] && result.data["12"]) {
												result.data["12"].ticker = result.ticker;
												result.data["12"].date = result.year;
												Cache.cacheData(tbl, result.data["12"]);
											}
										}
									}
									
									next();
								});
							});
						});
					});
				});
			});	
		}
	},
	
	cacheData: function(tbl, data) {
		console.log(u.sprintf("Caching ticker %s for year %d", data.ticker, data.date));
		
		db.mongo.collection(tbl + "_c", function(error, collection) {
			collection.insert(data, function(err) {});
		});
	},
	
	cacheFields: function(data, sortOrder) {
		console.log('caching fields for ' + data[0]);
		var fields = { name:data[1], type:data[2], sort:sortOrder, fields:[] };
		
		//retrieve valid fields
		db.mongo.collection(data[0], function(error, collection) {
            var date = fields.type < 100 ? Cache.maxDate : 20130717;
            console.log(date);
			collection.findOne({ date:date }, function(err, result) {
				for(var key in result) {
                    var excl = ['ticker', 'date', '_id', 'year', 'fdate', 'company_id', 'adate'];
					if(!u.inArray(key, excl) && (key.length < 3 || key.substring(0, 3) != 'dt_'))
                        fields.fields.push(key);
						//fields.fields.push(key.replace(/_/g, ' ')); 
				}
				
				fields.fields.sort();
				
				db.mongo.collection('fields', function(error, collection) {
					collection.insert(fields, function(err) {});
				});
			});
		});
	},
	
	copyBacktest: function() {
	    var tests = ["53d3c0a9641898a335c0c1ea", "53d3bf0f641898a335c0c1e5", "53d3be44641898a335c0c1e4"]; //momentum, earnings, value
	    var users = [];
	    var username = process.argv[4];
	    console.log(username);
	    
	    if(username && username.length) {
    	    db.mongo.collection("user", function(error, collection) {
    	        //var oid = new db.bson.ObjectID('53d596c31a6a48ae60a1b84b');
    	        
    	        collection.find({ u:username }, { _id:1 }).toArray(function(err, results) {
    	            for(var i = 0, len = results.length; i < len; i++) {
    	                users.push(results[i]._id.toString());
    	            }
    	            
    	            console.log(users);

    	            for(var i = 0, len = tests.length; i < len; i++) {
    	                copy(tests[i]);
    	            }
    	        });
    	    });
	    }

        function copy(bid) {
            var oid = new db.bson.ObjectID(bid), bt, btCP, btTR;
            
			db.mongo.collection("log_bt", function(error, collection) {
	            collection.find({ _id:oid }).toArray(function(err, results) {
				    var bt = results[0];
				    bt.ref_id = bt._id;
				    
				    for(var i = 0, len = users.length; i < len; i++) {
                        save(users[i], bt);
                    }
				    
                    /*db.mongo.collection("log_bt_cp", function(error, collection) {
                		collection.find({ id:bid }).toArray(function(err, results) {
                		    btCP = results;
                		    
            				db.mongo.collection("log_bt_tr", function(error, collection) {
                        		collection.find({ id:bid }).toArray(function(err, results) {
                    				btTR = results;
                    				
                    				for(var i = 0, len = users.length; i < len; i++) {
                                        save(users[i], bt, btCP, btTR);
                                    }
                    			});
            				});
            			});
                    });*/
				});
			});
	    }
	    
	    function save(uid, bt, btCP, btTR) {
	        bt.uid = uid;
	        bt.date = (new Date()).getTime();
	        delete bt._id;
	            
	        db.mongo.collection("log_bt", function(error, collection) {
	            collection.insert(bt, { safe:true }, function() {
	                var bid = bt._id.toString();
	                console.log('new id', bid);
	                Cache.exit();
	                
	                /*db.mongo.collection("log_bt_cp", function(error, collection) {
	                    console.log('capital', btCP.length);
    	                for(var i = 0, len = btCP.length; i < len; i++) {
    	                    btCP[i].id = bid;
    	                    delete btCP[i]._id;
    	                    collection.insert(btCP[i], function(err) { if(err) console.log(err) });
    	                }
	                });
	                
	                db.mongo.collection("log_bt_tr", function(error, collection) {
	                    console.log('trades', btTR.length);
    	                for(var i = 0, len = btTR.length; i < len; i++) {
    	                    btTR[i].id = bid;
    	                    delete btTR[i]._id;
    	                    collection.insert(btTR[i], function(err) { if(err) console.log(err) });
    	                }
	                });*/
	            });
	        });
	    }
	},
    
    exit: function() {
        setTimeout(function() {
            process.exit();
        }, 5000);
    }
}