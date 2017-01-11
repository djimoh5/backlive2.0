import { 
    DataEvent, DataSubscriptionEvent, DataFilterEvent, InitializeDataEvent, NetworkDateEvent, 
    FeedForwardCompleteEvent, BackpropagateCompleteEvent, EpochCompleteEvent
} from '../../event/app.event';
import { BaseDataNode, IDataNode, DataCache, DataResult, DateDataResult, ParamValues } from './data.node';

import { DataFieldMap, DataCollectionMap } from './field-map';
import { IndicatorParam, IndicatorParamType, DENORM_PARAM_TYPES } from '../../../core/service/model/indicator.model';

import { Common } from '../../../app/utility/common';

import { Database } from '../../../core/lib/database';

export class DataLoaderNode extends BaseDataNode {
    fields: Fields = {};
    ticker: string | string[];
    startDate: number;
    endDate: number;
    currentDate: number;
    prevDate: number;

    nonTickerTypes: IndicatorParamType[] = [IndicatorParamType.Macro];

    data: DataCache;
    dataCache: { [key: number]: DataCache } = {};
    allCacheKeys: string[] | number[];

    dates: number[] = [];
    datesCache: number[] = [];
    weeks: number[] = [];

    constructor() {
        super();

        this.subscribe(InitializeDataEvent, event => this.init());

        this.subscribe(DataSubscriptionEvent, event => {
            //console.log('updating data subscriptions', event.data.params);
            this.setFields(event.data.params);
        });

        this.subscribe(DataFilterEvent, event => {
            //console.log('updating data filters', event.data.startDate, event.data.endDate);
            this.ticker = event.data.entities;
            this.startDate = event.data.startDate;
            this.endDate = event.data.endDate;
        });

        this.subscribe(FeedForwardCompleteEvent, event => {
            this.nextTick();
        });

        this.subscribe(BackpropagateCompleteEvent, event => {
            if(this.currentDate !== this.prevDate) {
                this.execute();
            }
        });
    }

    init() {
        if(this.datesCache.length > 0) {
            this.dates = this.datesCache.slice(0);
            this.nextTick();
        }
        else {
            Database.mongo.collection('file_date', (err, collection) => {
                collection.find().sort({ date: 1 }).toArray((err, results) => {
                    if (err) {
                        console.log('Error selecting data: ' + err.message);
                        return;
                    } else {
                        for (var i = 0, cnt = results.length; i < cnt; i++) {
                            if (!results[i].hide) {
                                var date = parseInt(results[i].date.toString());

                                if(date >= 20160101 && date < 20160901) {
                                    this.dates.push(date);
                                    this.datesCache.push(date);
                                    this.weeks.push(results[i].wk);
                                }
                            }
                        }
                    }

                    this.nextTick();
                });
            });
        }
    }

    private nextTick() {
        this.currentDate = this.dates.splice(0, 1)[0];

        if(this.currentDate) {
            this.notify(new NetworkDateEvent(this.currentDate));
        }
        else {
            console.log('we should never get to this point!!!!');
            this.notify(new EpochCompleteEvent(null));
        }
    }

    private execute() {
        this.prevDate = this.currentDate;

        if(this.dates.length > 0) {
            if(this.dataCache[this.currentDate]) {
                this.notify(new DataEvent({ cache: this.dataCache[this.currentDate], allCacheKeys: null }));
            }
            else {
                console.log(this.currentDate);
                this.data = {};
                this.allCacheKeys = [];
                var numFieldTypes = 0;

                for (var type in this.fields) {
                    numFieldTypes++;
                }

                for (var type in this.fields) {
                    var t = parseInt(type);
                    this.callDB(this.currentDate, this.fields[type], t, (vals: DataResult, cacheType: number) => {
                        if (this.ticker && this.currentDate && Common.inArray(cacheType, this.nonTickerTypes)) {
                            //set key for ticker to value so that equations can be calculated
                            var tmpVals: DataResult = { 0: vals[0] };
                            var tkrs = toString.call(this.ticker) === "[object Array]" ? this.ticker : [this.ticker];

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

                        if (--numFieldTypes == 0) {
                            this.dataCache[this.currentDate] = this.data;
                            this.notify(new DataEvent({ cache: this.data, allCacheKeys: this.allCacheKeys }));
                        }
                    }, !this.ticker || Common.inArray(parseInt(type), this.nonTickerTypes) ? null : this.ticker);
                }
            }
        }
        else {
            //at last date so no need to feed forward
            this.notify(new EpochCompleteEvent(this.currentDate));
            //console.log('DataLoader Idle');
        }
    }

    private callDB(date: number | number[], fields: DBFields, type: number, callback: Function, ticker: string | string[]) { //optional ticker, otherwise get values for all tickers
        var self = this;
        var tickerArr: string[], dateArr: number[];
        if (ticker && Common.isArray(ticker))
            tickerArr = <string[]>ticker;

        if (date && Common.isArray(date)) {
            dateArr = <number[]>date;
        }

        Database.mongo.collection(DataCollectionMap[type], (error, collection) => {
            if (error) {
                this.callDB(date, fields, type, callback, ticker);
            }
            else {
                var query: { ticker?: any, date?: any } = {};
                fields.ticker = 1;

                if (tickerArr) {
                    query.ticker = { $in: tickerArr };
                }
                else if (ticker) {
                    query.ticker = ticker;
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
                                    if (!vals[result.date]) vals[result.date] = {};
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
                            if (result == null)
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
}

interface DBFields {
    [name: string]: number;
    ticker?: number;
    date?: number;
}

interface Fields {
    [key: number]: DBFields;
}