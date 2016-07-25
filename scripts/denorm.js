var fullLoad = false;
var NO_VALUE = -99999;

if(fullLoad)
    db = db.getSiblingDB("btif");
else
    db = db.getSiblingDB("btiftemp");

var dates = db.file_date.find();
db = db.getSiblingDB("btif");

print('Start Denorm Financials:' + db.fs.count());

for(var i = 0, len = dates.length(); i < len; i++) {
    var currDate = dates[i].date;

    //20090213 20090930 20101231 20110225 issues on these dates with counts
    var docs = db.is.find({ date:currDate });
    print("Denorm IS: " + docs.count());
    docs.forEach(function(row) {
        var nRow = { ticker:row.ticker, date:row.date, company_id:row.company_id };
        delete row._id;
        delete row.ticker;
        delete row.date;
        delete row.company_id;
        
        for(var key in row) {
            nRow['is_' + key] = row[key];
        }
        
        db.fs.insert(nRow);
    });
    
    var docs = db.bs.find({ date:currDate });
    print("Denorm BS: " + docs.count());
    docs.forEach(function(row) {
        var nRow = {};
        for(var key in row) {
            nRow['bs_' + key] = row[key];
        }
        
        delete nRow.bs__id;
        delete nRow.bs_ticker;
        delete nRow.bs_date;
        delete nRow.bs_company_id;
        
        db.fs.update({ date:row.date, ticker:row.ticker }, { $set:nRow });
    });
    
    var docs = db.cf.find({ date:currDate });
    print("Denorm CF: " + docs.count());
    docs.forEach(function(row) {
        var nRow = {};
        for(var key in row) {
            nRow['cf_' + key] = row[key];
        }
        
        delete nRow.cf__id;
        delete nRow.cf_ticker;
        delete nRow.cf_date;
        delete nRow.cf_company_id;
        
        db.fs.update({ date:row.date, ticker:row.ticker }, { $set:nRow });
    });
    
    var docs = db.snt.find({ date:currDate });
    print("Denorm SNT: " + docs.count());
    docs.forEach(function(row) {
        var nRow = {};
        for(var key in row) {
            if(row[key] != NO_VALUE)
                nRow['snt_' + key] = row[key];
        }
        
        delete nRow.snt__id;
        delete nRow.snt_ticker;
        delete nRow.snt_date;
        delete nRow.snt_company_id;
        
        db.fs.update({ date:row.date, ticker:row.ticker }, { $set:nRow });
    });
    
    /*var docs = db.fi.find({ date:currDate });
    print("Denorm FI: " + docs.count());
    docs.forEach(function(row) {
        var nRow = {};
        for(var key in row) {
            if(row[key] != NO_VALUE)
                nRow['fi_' + key] = row[key];
        }
        
        delete nRow.fi__id;
        delete nRow.fi_ticker;
        delete nRow.fi_date;
        
        db.fs.update({ date:row.date, ticker:row.ticker }, { $set:nRow });
    });*/
    
    var docs = db.dividend.find({ date:currDate });
    print("Denorm DIVIDEND: " + docs.count());
    docs.forEach(function(row) {
        var nRow = { dvp:row.amt, dvx:row.adate, dvt:row.type };
    	//printjson({ ticker:row.ticker, date:row.date });
    	//printjson(nRow);
    
        db.tickers.update({ ticker:row.ticker, date:row.date }, { $set:nRow });
    });
}

print('End Denorm Financials:' + db.fs.count());
