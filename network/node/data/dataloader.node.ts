import { DataEvent, DataSubscriptionEvent, DataFilterEvent, DataFeatureEvent, DataFeatureLabelEvent } from '../../event/app.event';
import { BaseDataNode, TrainingData, DataCache, DataResult, DateDataResult, ParamValues } from './data.node';

import { DataFieldMap, DataCollectionMap } from './field-map';
import { IndicatorParam, IndicatorParamType, DENORM_PARAM_TYPES } from '../../../core/service/model/indicator.model';

import { Common } from '../../../ui/src/app/utility/common';

import { Database } from '../../../core/lib/database';

import { Network } from '../../network';

export class DataLoaderNode extends BaseDataNode {
    fields: Fields;
    ticker: string | string[];
    startDate: number = 20100101;
    endDate: number = 20170108;
    filterEvent: DataFilterEvent;

    features: { [key: number]: { [key: string]: number }[] }; //date => tkr => features
    featuresLbl: { [key: number]: { [key: string]: number[] } }; //date => tkr => output
    featuresIndex: { [key: number]: { [key: string]: number } }; //date => feature _id => index
    featuresSort: string[]; //feature _id

    momentum: { [key: number]: { [key: string]: number[] } };

    tmpTrainingData: { input: number[], labels: number[] };
    
    currentDate: number;

    nonTickerTypes: IndicatorParamType[] = [IndicatorParamType.Macro];

    data: DataCache;
    allCacheKeys: string[] | number[];
    numFieldTypes: number;

    dates: number[];
    datesCache: number[];
    weeks: number[];

    loaded: boolean;
    executeStartTime: number;

    constructor() {
        super(0, 1); //TODO: this needs to be dynamic, prob by updating load to actually load the data

        this.subscribe(DataSubscriptionEvent, event => {
            if(event.data.isFeature) {
                this._numFeatures++;
                this.featuresSort.push(event.senderId);
            }

            this.setFields(event.data.params);
        });

        this.subscribe(DataFilterEvent, event => {
            this.filterEvent = event;
            //this.startDate = event.data.startDate;
            //this.endDate = event.data.endDate;
            console.log(event.data, this.startDate, this.endDate)
        });

        this.subscribe(DataFeatureEvent, event => {
            this.featuresIndex[event.date][event.senderId] = this.features[event.date].length;
            this.features[event.date].push(event.data);
            this.buildTrainingData(event.date);
        });

        this.subscribe(DataFeatureLabelEvent, event => {
            this.featuresLbl[event.date] = event.data;
            this.buildTrainingData(event.date);
        });
    }

    load(callback: (data: TrainingData) => void) {
        this.loaded = false;
        this.fields = {};

        var startTime = Date.now();

        this._numFeatures = 0;
        this.features = {};
        this.featuresLbl = {};
        this.featuresIndex = {};
        this.featuresSort = [];
        this.momentum = {
           .083: {}, .125: {}, .25: {}, .5: {}
        };

        this.trainingData = { input: null, labels: null };

        this.tmpTrainingData = { input: [], labels: [] };
        this.trainingDataKeys = [];

        Database.mongo.collection('file_date', (err, collection) => {
            collection.find({}).sort({ date: 1 }).toArray((err, results) => {
                if (err) {
                    console.log('Error selecting data: ' + err.message);
                    return;
                } else {
                    var prevDate;
                    this.dates = [];
                    this.datesCache = [];
                    this.weeks = [];

                    for (var i = 0, cnt = results.length; i < cnt; i++) {
                        if (!results[i].hide) {
                            var date = parseInt(results[i].date.toString());

                            if(date >= this.startDate && date <= this.endDate) {
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
                }

                console.log(this.dates);
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
            console.time('dataloader-time');
            this.dates = this.datesCache.slice(0);
            this.loadNextTick();
            this.loaded = true;
        }
    }

    private buildTrainingData(date: number) {
        if(this.features[date].length === this.numFeatures && typeof(this.featuresLbl[date]) !== 'undefined') {
            if(this.featuresLbl[date] !== null) {
                var vals: number[] = [];
                var valsLbl: number[] = [];
                var keys: string[] = [];

                for(var key in this.featuresLbl[date]) {
                    this._numClasses = this.featuresLbl[date][key].length;

                    var validKey: boolean = true;
                    var tmpVals: number[] = [];

                    for(var mf in this.momentum)
                    {
                        if(!this.momentum[mf][key])
                        {
                            this.momentum[mf][key] = [];
                        }
                    }

                    for(var i = 0, len = this.featuresSort.length; i < len; i++) {
                        var feature = this.features[date][this.featuresIndex[date][this.featuresSort[i]]];

                        if(feature.hasOwnProperty(key)) {
                            tmpVals.push(feature[key]);
                            //if(key === 'AAPL') console.log('AAPL', feature[key]);

                            for(var mf in this.momentum)
                            {
                                var mfVal: any = mf;
                                var val = this.momentum[mf][key][i];

                                val = typeof val !== 'undefined' ? ((val * (1 - mfVal)) + (feature[key] * mfVal)) : feature[key];
                                tmpVals.push(val);
                                this.momentum[mf][key][i] = val;

                                var relVal = val === 0 ? 0 : ((feature[key] - val) / Math.abs(val));
                                tmpVals.push(relVal);
                                //if(key === 'AAPL') console.log(mf, val, relVal);
                            }
                        }
                        else {
                            validKey = false;
                            break;
                        }
                    }

                    if(validKey) {
                        vals = vals.concat(tmpVals);
                        valsLbl = valsLbl.concat(this.featuresLbl[date][key]);
                        keys.push(key);
                    }
                }

                console.log('Date:', this.currentDate, 'Records:', vals.length);
                this.persistData(date, vals, valsLbl, keys);
            }
            
            this.loadNextTick();
        }
    }

    private persistData(date: number, vals: number[], valsLbl: number[], keys: string[], isFromCache: boolean = false) {
        this.tmpTrainingData.input.push.apply(this.tmpTrainingData.input, vals);
        this.tmpTrainingData.labels.push.apply(this.tmpTrainingData.labels, valsLbl);
        this.trainingDataKeys.push.apply(this.trainingDataKeys, keys);

        delete this.features[date];
        delete this.featuresLbl[date];
        delete this.featuresIndex[date];

        if(!isFromCache) {
            this.cacheData(Network.network._id, date, vals, valsLbl, keys);
        }
    }

    private convertTmpData() {
        this.trainingData.input = new Float32Array(this.tmpTrainingData.input);
        this.trainingData.labels = new Float32Array(this.tmpTrainingData.labels);
        this.tmpTrainingData = null;
        console.log(this.trainingData.input.length, this.trainingData.labels.length);

        var numMom = 0;
        for(var mf in this.momentum) { numMom++ };
        this._numFeatures = this._numFeatures + (this._numFeatures * (numMom * 2));
        console.log('# of features:', this._numFeatures);
    }

    private loadNextTick() {
        if(this.dates.length) {
            this.executeStartTime = Date.now();
            
            this.currentDate = this.dates.splice(0, 1)[0];
            //console.log('loading tick', this.currentDate);

            this.loadFromCache(Network.network._id, this.currentDate, (err, result) => {
                if(result) {
                    this._numFeatures = result.numFeat;
                    this._numClasses = result.numCls;
                    console.log('Date:', this.currentDate, 'Records:', result.input.length);
                    this.persistData(result.date, result.input, result.lbls, result.keys, true);
                    this.loadNextTick();
                }
                else {
                    this.features[this.currentDate] = [];
                    this.featuresIndex[this.currentDate] = {};

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
            });
        }
        else {
            this.convertTmpData();
            //console.log(this.trainingData);
            console.log('data loaded successfully');
            console.timeEnd('dataloader-time');
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

    protected getTickerFilter(): { [key: string]: any } {
        var filter: { [key: string]: any } = null;
        if(this.filterEvent) {
            filter = { ticker: { 
                $nin: ['SP500', 'SCT_01', 'SCT_02', 'SCT_03', 'SCT_04', 'SCT_05', 'SCT_06', 'SCT_07', 'SCT_08', 'SCT_09', 'SCT_10', 'SCT_11', 'SCT_12']
            }};
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