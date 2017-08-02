import { DataEvent, DataSubscriptionEvent, DataFilterEvent, DataFeatureEvent, DataFeatureOutEvent } from '../../event/app.event';
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

    features: { [key: number]: { [key: string]: number }[] }; //date => tkr => features
    featuresOut: { [key: number]: { [key: string]: number[] } }; //date => tkr => output

    validationDate: number;
    currentDate: number;

    nonTickerTypes: IndicatorParamType[] = [IndicatorParamType.Macro];

    data: DataCache;
    allCacheKeys: string[] | number[];
    numFieldTypes: number;

    dates: number[] = [];
    datesCache: number[] = [];
    weeks: number[] = [];

    loaded: boolean;
    executeStartTime: number;

    constructor() {
        super(0, 3); //TODO: this needs to be dynamic, prob by updating load to actually load the data

        this.subscribe(DataSubscriptionEvent, event => {
            if(event.data.isFeature) {
                this._numFeatures++;
            }

            this.setFields(event.data.params);
        });

        this.subscribe(DataFilterEvent, event => {
            console.log('updating data filters', event.data);
            this.filterEvent = event;
            this.startDate = event.data.startDate;
            this.endDate = event.data.endDate;
        });

        this.subscribe(DataFeatureEvent, event => {
            this.features[event.date].push(event.data);
            this.buildTrainingData(event.date);
        });

        this.subscribe(DataFeatureOutEvent, event => {
            this.featuresOut[event.date] = event.data;
            this.buildTrainingData(event.date);
        });
    }

    load(callback: (data: TrainingData) => void) {
        var startTime = Date.now();

        this.features = {};
        this.featuresOut = {};

        this.trainingData = { input: null, output: null };
        this.testData = { input: null, output: null };
        this.trainingDataKeys = [];
        this.testDataKeys = [];

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

                            if(date >= 20120101 && date <= 20170108) {
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

                    this.validationDate = 20160108;
                }

                Network.timings.data += Date.now() - startTime;
                callback(null);
            });
        });
    }

    train() {
        if(this.loaded) {
            super.train();
        }
        else {
            this.dates = this.datesCache.slice(0);
            this.loadNextTick();
            this.loaded = true;
        }
    }

    private buildTrainingData(date: number) {
        if(this.features[date].length === this.numFeatures && typeof(this.featuresOut[date]) !== 'undefined') {
            if(this.featuresOut[date] !== null) {
                var vals: number[] = [];
                var valsOut: number[] = [];
                var keys = this.currentDate < this.validationDate ? this.trainingDataKeys : this.testDataKeys;

                for(var key in this.featuresOut[date]) {
                    this._numClasses = this.featuresOut[date][key].length;

                    var validKey: boolean = true;
                    var tmpVals: number[] = [];

                    for(var i = 0, feature: { [key: string]: number }; feature = this.features[date][i]; i++) {
                        if(feature.hasOwnProperty(key)) {
                            tmpVals.push(feature[key]);
                        }
                        else {
                            validKey = false;
                            break;
                        }
                    }

                    if(validKey) {
                        vals = vals.concat(tmpVals);
                        valsOut = valsOut.concat(this.featuresOut[date][key]);
                        keys.push(key);
                    }
                }

                var inputs: Float32Array, outputs: Float32Array;
                var data = this.currentDate < this.validationDate ? this.trainingData : this.testData;

                if(data.input) {
                    inputs = this.appendFloat32Array(<Float32Array>data.input, vals);
                    outputs = this.appendFloat32Array(<Float32Array>data.output, valsOut);
                }
                else {
                    inputs = new Float32Array(vals);
                    outputs = new Float32Array(valsOut);
                }

                data.input = inputs;
                data.output = outputs;
                delete this.features[date];
                delete this.featuresOut[date];
                console.log(date, data.input.length, data.output.length);
            }

            this.loadNextTick();
        }
    }

    private appendFloat32Array(floatArr: Float32Array, arr: number[]) {
        var appended: Float32Array = new Float32Array(floatArr.length + arr.length);
        appended.set(floatArr);
        appended.set(arr, floatArr.length);
        return appended;
    }

    private loadNextTick() {
        if(this.dates.length) {
            this.executeStartTime = Date.now();
            
            this.currentDate = this.dates.splice(0, 1)[0];
            console.log('loading tick', this.currentDate);

            this.features[this.currentDate] = [];

            this.data = {};
            this.allCacheKeys = [];
            this.numFieldTypes = 0;
            this.ticker = null;

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
        else {
            //console.log(this.trainingData);
            //console.log(this.testData);
            console.log('data loaded successfully');
            this.nextBatch();
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

    private getTickerFilter() {
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