/// <reference path="../../typings/index.d.ts" />

var jStat = require("../../js/jstat.min.js").jStat;

export class Stats {
    static percentRank(vals: { [key: string]: number }, sortDesc: boolean = false) {
        var newVals: { [key: string]: number } = {};
        
        var arr: string[] = Stats.sort(vals, sortDesc);
        var len = arr.length;

        for(var i = 0; i < len; i++) {
            newVals[arr[i]] = (len - i) / len;
        }

        return newVals;
    }

    static zScore(vals: { [key: string]: number }) {
        var valArr: number[] = [];
        var newVals: { [key: string]: number } = {};

        for(var key in vals) {
            valArr.push(vals[key]);
        }

        var stdev = jStat.stdev(valArr);
        var mean = jStat.mean(valArr);

        for(var key in vals) {
            newVals[key] = (vals[key] - mean) / stdev;
        }

        //console.log(mean, stdev);
        return newVals;
    }

    static scaleMinMax(vals: { [key: string]: number }) {
        var newVals: { [key: string]: number } = {};
        var max: number = null, min: number = null;

        for(var key in vals) {
            if(max === null || vals[key] > max) {
                max = vals[key];
            }
            
            if(min === null || vals[key] < min) {
                min = vals[key];
            }
        }

        var range = max - min;

        for(var key in vals) {
            newVals[key] = (vals[key] - min) / range;
        }

        return newVals;
    }

    static sort(vals: { [key: string]: number }, sortDesc: boolean = false) {
        var arr: string[] = [];
        var sortDir = sortDesc ? -1 : 1;

        for(var key in vals) {
            arr.push(key);
        }

        arr.sort((a: string, b: string) => {
            if(vals[a] <= vals[b]) {
                return -1 * sortDir;
            }
            else {
                return 1 * sortDir;
            }
        });

        return arr;
    }

    static randomNormalDist(mean: number, standardDeviation: number) {
        return jStat.normal.sample(mean, standardDeviation);
    }
}