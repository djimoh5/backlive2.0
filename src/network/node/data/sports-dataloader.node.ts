import { DataEvent, DataSubscriptionEvent, DataFilterEvent, DataFeatureEvent, DataFeatureLabelEvent } from '../../event/app.event';
import { BaseDataNode, TrainingData, DataCache, DataResult, DateDataResult, ParamValues } from './data.node';

import { DataFieldMap, DataCollectionMap } from './field-map';
import { IndicatorParam, IndicatorParamType, DENORM_PARAM_TYPES } from '../../../core/service/model/indicator.model';

import { DataLoaderNode } from './dataloader.node';

import { Common } from '../../../app/utility/common';

import { Database } from '../../../core/lib/database';

import { Network } from '../../network';

/*export class SportsDataLoaderNode extends DataLoaderNode {
    constructor() {
        super();
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

    protected getTickerFilter(): { [key: string]: any } {
        return null;
    }
}

interface DBFields {
    [name: string]: number;
    ticker?: number;
    date?: number;
}

interface Fields {
    [key: number]: DBFields;
}*/