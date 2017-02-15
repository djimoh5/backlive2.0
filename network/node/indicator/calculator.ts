import { Operator, Indicator, IndicatorParam, IndicatorParamType, IndicatorParamTransform, DENORM_PARAM_TYPES } from '../../../core/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../data/data.node';
import { DataFieldMap, DataCollectionMap, NO_VALUE } from '../data/field-map';

export class Calculator {
    values: { [key: string]: any } = {};

    constructor() {
    }

    execute(indicator: Indicator, cache: DataCache, subEq?: boolean, ticker?: string, date?: number | string) {
        var vals = [];
        var fields: string[] = [];
        var fns: number[] = [];

        if (date) { date = parseInt(<string>date); };

        for (var i = 0, cnt = indicator.vars.length; i < cnt; i++) {
            var obj = indicator.vars[i];

            if (!obj) {
                //this.params.push(null);
            }
            else if (Common.isArray(obj)) { //var is a IndicatorParam, not an Indicator
                var type: IndicatorParamType = obj[0];
                var field: string = obj[1];
                var fn: number = obj[2];

                if (type == IndicatorParamType.Constant) {
                    //set each ticker to the constant val
                    var cVals = { '0': field }; //ticker 0 is for macro, eurodollar etc

                    if (!ticker) {
                        if (this.values['allCacheKeys']) {
                            for (var key in this.values['allCacheKeys']) { //just loop to reference each ticker
                                cVals[key] = field;
                            }
                        }
                    }

                    vals.push(cVals);
                    fields.push(null);
                }
                else {
                    var map = DataFieldMap.toFieldName(type, field);

                    if (Common.inArray(type, DENORM_PARAM_TYPES)) {
                        map = DataCollectionMap[type] + '_' + (map ? map : field);
                        type = IndicatorParamType.FinancialStatement;
                    }

                    if (map) {
                        field = map;
                    }

                    if (date) {
                        if (cache[type][date]) {
                            vals.push(ticker ? { '0': cache[type][date][ticker] } : cache[type][date]);
                        }
                        else {
                            vals.push({});
                        }
                    }
                    else {
                        vals.push(ticker ? { '0': cache[type][ticker] } : cache[type]);
                    }

                    fields.push(field);
                }

                fns.push(fn);
            }
            else {
                (<Indicator>obj).allowNeg = indicator.allowNeg;
                vals.push(this.execute(<Indicator>obj, cache, true, ticker, date));
                fields.push(null);
                fns.push(null);
            }
        }

        return this.calculate(vals, fields, indicator.ops, fns, subEq, indicator.allowNeg ? true : false);
    }

    private calculate(vals: any[], fields: string[], ops: Operator[], fns: number[], subEq: boolean, signed: boolean) { //ticker set for market S&P500 when calculating exposure
        var finalVals: { [key: string]: number } = {};
        var errors = 0;
        var cnt = 0;
        var val;

        for (var key in vals[0]) {
            if (key == '0' && !vals[0][key]) {
                val = null;
            }
            else {
                val = fields[0] != null ? vals[0][key][fields[0]] : vals[0][key];
            }

            if (!Common.isNumber(val) || val == NO_VALUE) {
                errors++;
                val = NO_VALUE;
            }
            else {
                if (fns[0] && fns[0] == IndicatorParamTransform.AbsoluteValue) {
                    val = Math.abs(val);
                }

                for (var i = 1, len = vals.length; i < len; i++) {
                    var tmpVal = fields[i] != null ? (vals[i][key] ? vals[i][key][fields[i]] : null) : vals[i][key];

                    if (!Common.isNumber(tmpVal) || tmpVal == NO_VALUE || val == NO_VALUE) {
                        errors++;
                        val = NO_VALUE;
                        break;
                    }
                    else {
                        var op = ops[i - 1];

                        if (fns[i] && fns[i] == IndicatorParamTransform.AbsoluteValue) {
                            tmpVal = Math.abs(tmpVal);
                        }

                        switch (op) {
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

                        if (!Common.isNumber(val) || val == NO_VALUE) {
                            errors++;
                            val = NO_VALUE;
                            break;
                        }

                        cnt++;
                    }
                }
            }

            if (!subEq && !signed && val < 0) {
                val = NO_VALUE;
            }

            if (val != NO_VALUE) {
                finalVals[key] = val;
            }
        }

        return finalVals;
    }

    addValue(key: string, val: any) {
        this.values[key] = val;
    }

    getIndicatorParams(indicators: Indicator[]): IndicatorParam[] {
        var params: IndicatorParam[] = [];

        indicators.forEach(indicator => {
            this.getIndicatorParamsHelper(indicator, params);
        });

        return params;
    }

    private getIndicatorParamsHelper(indicator: Indicator, params: IndicatorParam[]) {
        for (var i = 0, cnt = indicator.vars.length; i < cnt; i++) {
            var obj = indicator.vars[i];

            if (obj) {
                if (!Common.isArray(obj)) {
                    this.getIndicatorParamsHelper(<Indicator>obj, params);
                }
                else {
                    var type: number = parseInt(obj[0]);
                    var field: string = obj[1];
                    params.push([type, field]);
                }
            }
        }
    }
}