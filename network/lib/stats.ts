export class Stats {
    static percentRank(vals: { [key: string]: number }) {
        var arr: string[] = [];
        var newVals: { [key: string]: number } = {};

        for(var key in vals) {
            arr.push(key);
        }

        arr.sort((a: string, b: string) => {
            if(vals[a] <= vals[b]) {
                return -1;
            }
            else {
                return 1;
            }
        });

        var len = arr.length;
        arr.forEach((key, index) => {
            newVals[key] = (len - index) / len
        });

        return newVals;
    }
}