import {EventQueue} from '../lib/events/event-queue';

import {DataEvent, DataSubscriptionEvent} from '../lib/events/app-event';
import {BaseDataHandler, IDataHandler, DataCache, CacheResult} from './data-handler';

import {RFIELD_MAP} from './field-map';
import {IndicatorParamType, Param} from '../../app/service/model/indicator.model';

import {Common} from '../../app/utility/common';

import {Database} from '../lib/data-access/database';

export class DataLoaderDataHandler extends BaseDataHandler {
    fields: Fields;
    ticker: string | string[];
    startDate: number;
    endDate: number;
    
    useDenormTable: boolean = true;
    denormParamTypes: IndicatorParamType[] = [IndicatorParamType.IncomeStatement, IndicatorParamType.BalanceSheet, IndicatorParamType.CashFlowStatement, IndicatorParamType.Statistic];	
    tables = [ "", "is", "bs", "cf", "snt", "mos", "tech", "macro", "shrt_intr", "is_gr", "fs", "fi" ];
    nonTickerTypes = [IndicatorParamType.Macro];
    
    cache: DataCache;
    allCacheKeys: string[] | number[];
    
    constructor() {
        super();
        this.subscribe(DataSubscriptionEvent, (event: DataSubscriptionEvent) => {
            this.ticker = event.data.entities;
            this.startDate = event.data.startDate;
            this.endDate = event.data.endDate;
            this.setFields(event.data.params);
        });
    }
    
    init() {
        var dates : number[] = [], 
            weeks: number[] = [];

        Database.mongo.collection('file_date', (err, collection) => {
            collection.find().sort({ date:1 }).toArray((err, results) => {
                if(err) {
                    console.log('Error selecting data: ' + err.message);
                    return;
                } else {
                    for(var i = 0, cnt = results.length; i < cnt; i++) {
                        if(!results[i].hide) {
                            dates.push(parseInt(results[i].date.toString()));
                            weeks.push(results[i].wk);
                        }
                    }
                }
                
                this.execute(dates, weeks);
            });
        });
    }
    
    private execute(dates: number[], weeks: number[]) {
        var self = this;
        this.cache = {};
        this.allCacheKeys = [];
        var numFieldTypes = 0;
		
		for(var type in this.fields) {
			numFieldTypes++;
		}
        
        var date: number = dates.splice(0, 1)[0];
        var cnt: number = numFieldTypes;
        
        if(date) {
            console.log(date);
            
            for(var type in this.fields) {
                var t = parseInt(type);
                this.callDB(date, this.fields[type], t, function(vals: CacheResult, cacheType: number) {
                    if(self.ticker && date && Common.inArray(cacheType, self.nonTickerTypes)) {
                        //set key for ticker to value so that equations can be calculated
                        var tmpVals: CacheResult = { 0:vals[0] };
                        var tkrs = toString.call(self.ticker) === "[object Array]" ? self.ticker : [self.ticker];
                        
                        for(var t = 0, tlen = tkrs.length; t < tlen; t++) {
                            for(var key in vals) {
                                tmpVals[<string> tkrs[t]] = vals[key];
                            }
                        }

                        self.cache[cacheType] = tmpVals;
                    }
                    else {
                        self.cache[cacheType] = vals;
                    }
                    
                    if(--cnt == 0) {
                        self.notify(new DataEvent({ cache: self.cache, allCacheKeys: self.allCacheKeys }));
                        self.execute(dates, weeks);
                    }
                }, !this.ticker || Common.inArray(parseInt(type), this.nonTickerTypes) ? null : this.ticker);
            }
        }
        else {
            console.log('DataLoader idle');
        }
    }
    
    private callDB(date: number | number[], fields: DBFields, type: number, callback: Function, ticker: string | string[]) { //optional ticker, otherwise get values for all tickers
        var self = this;
        var tickerArr: string[], dateArr: number[];
        if(ticker && Common.isArray(ticker))
            tickerArr = <string[]> ticker;
          
        if(date && Common.isArray(date)) {
            dateArr = <number[]> date;
        }

		Database.mongo.collection(this.tables[type], (error, collection) => {
			if(error) {
				this.callDB(date, fields, type, callback, ticker);
			}
			else {
                var query: { ticker?: any, date?: any } = {};
				fields.ticker = 1;
                
                if(tickerArr) {
                    query.ticker = { $in:tickerArr };
                }
                else if(ticker) {
                    query.ticker = ticker;
                }
 
                if(date) {
                    if(dateArr) {
                        query.date = { $in:dateArr };
                        fields.date = 1;
                    }
                    else {
                        query.date = date;
                    }
                    
                    collection.find(query, fields, function(err, cursor) {
                        var vals: CacheResult = {};

                        cursor.each(function(err, result) {
                            if(result == null) {
                                //console.log('Table Time', tables[type], (new Date()).getTime() - st);
    				            callback(vals, type);
                            }
                            else {
                                if(dateArr) {
                                    if(!vals[result.date]) vals[result.date] = {};
                                    vals[result.date][result.ticker] = result;
                                }
                                else
                                    vals[result.ticker] = result;
                                    
                                self.allCacheKeys[result.ticker] = 1;
                            }
    				    });
    				});
                }
                else {
                    fields.date = 1;
                    query.date = { $gt:(Common.dbDate(new Date()) - 100000) }; //minus 100000 converts current date to 10 years ago
                 
                    //group by date
                    var hint = query.ticker ? { hint:{ ticker:1, date:1 } } : { hint:{ date:1 } };
                    
                    collection.find(query, fields, hint, function(err, cursor) {
            			var vals = {};
    					
    					cursor.each(function(err, result) {
    					    if(result == null)
    					        callback(vals, type);
    					    else {
                                vals[result.date] = result;
                                self.allCacheKeys[result.date] = 1;
    					    }
    				    });
    				});
                }
			}
		});
	}

    setFields(params: [number, string][]) {
        this.fields = {};
        
    	for(var i = 0, cnt = params.length; i < cnt; i++) {
			var type = params[i][0];
            var field = params[i][1];
            
            if(type != IndicatorParamType.Constant) { // && (type != ParamType.Statistic || field != "price")) {
                var map: string = RFIELD_MAP[type] ? RFIELD_MAP[type][field] : null;

                if(this.useDenormTable && Common.inArray(type, this.denormParamTypes)) {
                    map = this.tables[type] + '_' + (map ? map : field);
                    type = IndicatorParamType.FinancialStatement;
                }
                
                if(!this.fields[type]) {
                    this.fields[type] = {};
                }
                
                if(map) {
                    this.fields[type][map] = 1;
                }
                else {
                    this.fields[type][field] = 1;
                }
            }
		}
	}
}

interface DBFields {
    [name: string]: number;
    ticker?: number;
    date?: number;
}

interface Fields {
    [key: number]: DBFields;
}