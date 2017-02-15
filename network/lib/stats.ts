var jStat = require("../../js/jstat.min.js").jStat;

export class Stats {
    static percentRank(vals: { [key: string]: number }, sortDesc: boolean = false) {
        var newVals: { [key: string]: number } = {};
        
        var arr: string[] = Stats.sort(vals, sortDesc);
        var len = arr.length;

        arr.forEach((key, index) => {
            newVals[key] = (len - index) / len;
        });

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