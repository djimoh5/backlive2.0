var currDate = 20141003;
var NO_VALUE = -99999;

db = db.getSiblingDB("btif");
print('Start Denorm Financials:' + db.fs.count());

var docs = db.is.find({ date:currDate });
print("Denorm IS: " + docs.count());
docs.forEach(function(row) {
    var nRow = {};
    for(var key in row) {
        nRow['is_' + key] = row[key];
    }
    
    delete nRow.is__id;
    delete nRow.is_ticker;
    delete nRow.is_date;
    delete nRow.is_company_id;
    
    db.fs.update({ date:row.date, ticker:row.ticker }, { $set:nRow });
});

/*var docs = db.bs.find({ date:currDate });
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
});*/