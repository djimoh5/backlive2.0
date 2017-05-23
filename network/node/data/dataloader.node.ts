import { 
    DataEvent, DataSubscriptionEvent, DataFilterEvent, InitializeDataEvent, ValidateDataEvent,
    BackpropagateCompleteEvent, EpochCompleteEvent
} from '../../event/app.event';
import { BaseDataNode, TrainingData, DataCache, DataResult, DateDataResult, ParamValues } from './data.node';

import { DataFieldMap, DataCollectionMap } from './field-map';
import { IndicatorParam, IndicatorParamType, DENORM_PARAM_TYPES } from '../../../core/service/model/indicator.model';

import { Common } from '../../../app/utility/common';

import { Database } from '../../../core/lib/database';

import { Network } from '../../network';

export class DataLoaderNode extends BaseDataNode {
    fields: Fields = {};
    ticker: string | string[];
    startDate: number;
    endDate: number;
    filterEvent: DataFilterEvent;

    validationDate: number;
    currentDate: number;
    backPropDate: number;

    nonTickerTypes: IndicatorParamType[] = [IndicatorParamType.Macro];

    data: DataCache;
    dataCache: { [key: number]: DataCache } = {};
    allCacheKeys: string[] | number[];
    numFieldTypes: number;

    dates: number[] = [];
    datesCache: number[] = [];
    weeks: number[] = [];

    validating: boolean;

    executeStartTime: number;

    constructor() {
        super();

        this.subscribe(DataSubscriptionEvent, event => {
            this.setFields(event.data.params);
        });

        this.subscribe(DataFilterEvent, event => {
            console.log('updating data filters', event.data);
            this.filterEvent = event;
            this.startDate = event.data.startDate;
            this.endDate = event.data.endDate;
        });

        this.subscribe(InitializeDataEvent, event => {
            this.backPropDate = null;
            this.init();
        });

        this.subscribe(BackpropagateCompleteEvent, event => {
            if(event.date !== this.backPropDate) {
                this.backPropDate = event.date;
                this.nextTick();
            }
        });

        this.subscribe(ValidateDataEvent, event => {
            this.validating = true;
            this.execute();
        });
    }

    load(callback: (data: TrainingData) => void) {}

    init() {
        this.validating = false;
        var startTime = Date.now();

        if(this.datesCache.length > 0) {
            this.dates = this.datesCache.slice(0);
            Network.timings.data += Date.now() - startTime;
            this.nextTick();
        }
        else {
            Database.mongo.collection('file_date', (err, collection) => {
                collection.find({ wk: 1 }).sort({ date: 1 }).toArray((err, results) => {
                    if (err) {
                        console.log('Error selecting data: ' + err.message);
                        return;
                    } else {
                        var prevDate;
                        for (var i = 0, cnt = results.length; i < cnt; i++) {
                            if (!results[i].hide) {
                                var date = parseInt(results[i].date.toString());

                                if(date >= 20070101 && date <= 20170108) {
                                    if(prevDate && date <= prevDate) {
                                        console.log("Error: Duplicate network dates fired " + date);
                                        throw("Duplicate network dates fired " + date);
                                    }

                                    this.dates.push(date);
                                    this.datesCache.push(date);
                                    this.weeks.push(results[i].wk);
                                    prevDate = date;
                                }
                            }
                        }

                        this.validationDate = 20120108;
                    }

                    Network.timings.data += Date.now() - startTime;
                    this.nextTick();
                });
            });
        }
    }

    private nextTick() {
        this.currentDate = this.dates.splice(0, 1)[0];
        this.execute();
    }

    execute() {
        if(this.currentDate) {
            this.executeStartTime = Date.now();

            if(this.currentDate >= this.validationDate && !this.validating) {
                Network.timings.data += Date.now() - this.executeStartTime;
                this.notify(new EpochCompleteEvent(null));
                return;
            }

            if(this.dataCache[this.currentDate]) {
                Network.timings.data += Date.now() - this.executeStartTime;
                this.notify(new DataEvent({ cache: this.dataCache[this.currentDate], allCacheKeys: null }, this.currentDate));
            }
            else {
                this.data = {};
                this.allCacheKeys = [];
                this.numFieldTypes = 0;
                this.ticker = null;

                console.log(this.currentDate);

                for (var type in this.fields) {
                    this.numFieldTypes++;
                }

                if(this.fields[IndicatorParamType.Ticker]) {
                    //get tickers first so we can filter other tables
                    this.loadData(IndicatorParamType.Ticker, this.getTickerFilter(), data => {
                        this.ticker = [];
                        var exclADRs = this.filterEvent && this.filterEvent.data.adr === 0;
                     
                        for(var tkr in data) {
                            if(!exclADRs || data[tkr]['adr'] !== 1) {
                                this.ticker.push(tkr);
                            }
                        }

                        for (var type in this.fields) {
                            var t = parseInt(type);
                            if(t !== IndicatorParamType.Ticker) {
                                this.loadData(t);
                            }
                        }
                    });
                }
                else {
                    for (var type in this.fields) {
                        this.loadData(parseInt(type));
                    }
                }
            }
        }
        else {
            this.notify(new EpochCompleteEvent(null));
        }
    }

    private loadData(type: IndicatorParamType, filter?: { ticker?: any, [key: string]: any }, callback?: (data: DataResult) => void) {
        if(!filter) {
            filter = {};
        }
        
        if(this.ticker && !Common.inArray(type, this.nonTickerTypes)) {
            filter.ticker = Common.isArray(this.ticker) ? { $in: this.ticker } : this.ticker;
        }
        
        this.callDB(this.currentDate, this.fields[type], type, (vals: DataResult, cacheType: number) => {
            if (this.ticker && this.currentDate && Common.inArray(cacheType, this.nonTickerTypes)) {
                //set key for ticker to value so that equations can be calculated
                var tmpVals: DataResult = { 0: vals[0] };
                var tkrs = Common.isArray(this.ticker) ? this.ticker : [this.ticker];

                for (var t = 0, tlen = tkrs.length; t < tlen; t++) {
                    for (var key in vals) {
                        tmpVals[<string>tkrs[t]] = vals[key];
                    }
                }

                this.data[cacheType] = tmpVals;
            }
            else {
                this.data[cacheType] = vals;
            }

            if(callback) {
                callback(this.data[cacheType]);
            }
            
            if (--this.numFieldTypes == 0) {
                Network.timings.data += Date.now() - this.executeStartTime;
                this.dataCache[this.currentDate] = this.data;
                this.notify(new DataEvent({ cache: this.data, allCacheKeys: this.allCacheKeys }, this.currentDate));
            }
        }, filter);
    }

    private callDB(date: number | number[], fields: DBFields, type: number, callback: Function, filter?: { [key: string]: any }) { //optional filter, otherwise get values for all tickers
        var self = this;
        var dateArr: number[];

        if (date && Common.isArray(date)) {
            dateArr = <number[]>date;
        }

        Database.mongo.collection(DataCollectionMap[type], (error, collection) => {
            if (error) {
                this.callDB(date, fields, type, callback, filter);
            }
            else {
                var query: { ticker?: any, date?: any } = {};
                fields.ticker = 1;

                if (filter) {
                    query = filter;
                }
                
                if (date) {
                    if (dateArr) {
                        query.date = { $in: dateArr };
                        fields.date = 1;
                    }
                    else {
                        query.date = date;
                    }

                    collection.find(query, fields, function (err, cursor) {
                        var vals: DataResult | DateDataResult = {};

                        cursor.each(function (err, result: ParamValues) {
                            if (result == null) {
                                //console.log('Table Time', tables[type], (new Date()).getTime() - st);
                                callback(vals, type);
                            }
                            else {
                                if (dateArr) {
                                    if (!vals[result.date]) { vals[result.date] = {}; }
                                    vals[result.date][result.ticker] = result;
                                }
                                else {
                                    vals[result.ticker] = result;
                                }

                                self.allCacheKeys[result.ticker] = 1;
                            }
                        });
                    });
                }
                else {
                    fields.date = 1;
                    query.date = { $gt: (Common.dbDate(new Date()) - 100000) }; //minus 100000 converts current date to 10 years ago

                    //group by date
                    var hint = query.ticker ? { hint: { ticker: 1, date: 1 } } : { hint: { date: 1 } };

                    collection.find(query, fields, hint, function (err, cursor) {
                        var vals: DataResult = {};

                        cursor.each(function (err, result) {
                            if (result == null) {
                                callback(vals, type);
                            }
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

    private setFields(params: IndicatorParam[]) {
        for (var i = 0, cnt = params.length; i < cnt; i++) {
            var type = params[i][0];
            var field = params[i][1];

            if (type != IndicatorParamType.Constant) {
                var map: string = DataFieldMap.toFieldName(type, <string>field);

                if (Common.inArray(type, DENORM_PARAM_TYPES)) {
                    map = DataCollectionMap[type] + '_' + (map ? map : field);
                    type = IndicatorParamType.FinancialStatement;
                }

                if (!this.fields[type]) {
                    this.fields[type] = {};
                }

                this.fields[type][map || field] = 1;
            }
        }
    }

    getTickerFilter() {
        var filter: { [key: string]: any } = null;
        if(this.filterEvent) {
            filter = {};
            var data = this.filterEvent.data;

            if(data.exchange) {
                filter['exchange'] = data.exchange;
            }
            
            if(data.index) {
                switch(data.index) {
                    case 'sp': filter['sp'] = '500'; break;
                    case 'dow': filter['dow'] = 'DI'; break;
                }
            }

            //market cap filter
            var mktcapFilter;
            if(data.minMktCap) {
                mktcapFilter = { $gte: data.minMktCap };
            }

            if(data.maxMktCap) {
                if(mktcapFilter) {
                    mktcapFilter['$lte'] = data.maxMktCap;
                }
                else {
                    mktcapFilter = { $lte: data.maxMktCap };
                }
            }

            if(mktcapFilter) {
                filter['mktcap'] = mktcapFilter;
            }
        }

        return filter;
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