db = db.getSiblingDB("btiftemp");
var dates = db.file_date.find();
var currDate = dates[0].date;

db = db.getSiblingDB("btif");
print(currDate);
var indices = ["SP500", "SCT_01", "SCT_02", "SCT_03", "SCT_04", "SCT_05", "SCT_06", "SCT_07", "SCT_08", "SCT_09", "SCT_10", "SCT_11", "SCT_12"];

for(var i = 0, len = indices.length; i < len; i++) {
    var docs = db.tech.find({ date:currDate, ticker:indices[i] });
    docs.forEach(function(row) {
        var obj = { price:row.price, priceh_52w:row.prh52wk, pricel_52w:row.prl52wk, prchg_04w:row.prchg4wk, prchg_13w:row.prchg13wk, prchg_26w:row.prchg26wk, prchg_52w:row.prchg52wk };
        //printjson(obj);
        
        db.snt.update({ date:row.date, ticker:row.ticker }, { $set:obj });
        //var obj2 = db.snt.findOne({ date:row.date, ticker:row.ticker });
        //printjson(obj2);
    });
}

/*** recalculate EPS ***/
var indices = ["SP500", "SCT_01", "SCT_02", "SCT_03", "SCT_04", "SCT_05", "SCT_06", "SCT_07", "SCT_08", "SCT_09", "SCT_10", "SCT_11", "SCT_12"];

for(var i = 0, len = indices.length; i < len; i++) {
    var docs = db.is.find({ date:currDate, ticker:indices[i] }, { date:1, ticker:1, netinc:1 });
    docs.forEach(function(row) {
        var snt = db.snt.findOne({ date:row.date, ticker:row.ticker }, { mktcap:1, price:1 });
        //printjson([row.date, row.ticker, row.netinc, snt.mktcap, snt.price]);
        
        var eps = snt.price * row.netinc / snt.mktcap;
        eps = parseFloat(Math.round(eps * Math.pow(10, 2)) / Math.pow(10, 2))
        var obj = { epscon:eps, eps:eps, epsd:eps, epsdc:eps };
        //printjson(obj);
        
        db.is.update({ date:row.date, ticker:row.ticker }, { $set:obj });
        //var obj2 = db.is.findOne({ date:row.date, ticker:row.ticker });
        //printjson(obj2);
    });
}
