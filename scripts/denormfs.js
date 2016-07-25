db = db.getSiblingDB("btif");
var dates = db.file_date.find().sort({ date:1 });
var NO_VALUE = -99999;

print('Start Denorm Financials:' + db.fsc.count());

function clearRow(row) {
    delete row._id;
    delete row.ticker;
    delete row.date;
    delete row.company_id;

    return row;
}

function writeData() {
    for(var tkr in finalDocs) {
        db.fsc.insert(finalDocs[tkr]);    
    }
    
    finalDocs = {};
    prevIS = {};
    prevBS = {};
    prevCF = {};
    prevSNT = {};
}

var fullLoad = false;

var finalDocs = {}, prevIS = {}, prevBS = {}, prevCF = {}, prevSNT = {};
var prevYrMth, currWkIndex = 0;
var recentYrMth = (dates[dates.length() - 1].date + "").substring(0, 6);

print(recentYrMth);

if(!fullLoad) {
    //remove data for current month
    db.fsc.remove({ date:recentYrMth });
}

for(var i = 0, len = dates.length(); i < len; i++) {
    var currDate = dates[i].date;
    var currYrMth = (currDate + "").substring(0, 6);
    var currDay = (currDate + "").substring(6, 8);
 
    if(!fullLoad && recentYrMth != currYrMth)
        continue;
 
    if(currYrMth != prevYrMth) {
        writeData();
        prevYrMth = currYrMth;
        currWkIndex = 0;
    }
    else
        currWkIndex++;
    
    print(currDate, currWkIndex);
    
    var docs = db.is.find({ date:currDate });
    //print("Denorm IS: " + docs.count());
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(!finalDocs[tkr])
            finalDocs[tkr] = { ticker:tkr, date:currYrMth, company_id:row.company_id };

        row = clearRow(row);
            
        //add each key ONLY if value does not match previous week
        for(var key in row) {
            if(row[key] != NO_VALUE) {
                var nKey = 'is_' + key;
                
                if(!finalDocs[tkr][nKey])
                    finalDocs[tkr][nKey] = [];
                    
                if(!prevIS[tkr] || prevIS[tkr][key] != row[key])
                    finalDocs[tkr][nKey][currWkIndex] = row[key];
            }
        }
        
        prevIS[tkr] = row;
    });

    var docs = db.bs.find({ date:currDate });
    //print("Denorm BS: " + docs.count());
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(finalDocs[tkr]) {
            row = clearRow(row);
            
            for(var key in row) {
                if(row[key] != NO_VALUE) {
                    var nKey = 'bs_' + key;
                    
                    if(!finalDocs[tkr][nKey])
                        finalDocs[tkr][nKey] = [];
                        
                    if(!prevBS[tkr] || prevBS[tkr][key] != row[key])
                        finalDocs[tkr][nKey][currWkIndex] = row[key];
                }
            }
            
            prevBS[tkr] = row;
        }
    });
    
    var docs = db.cf.find({ date:currDate });
    //print("Denorm CF: " + docs.count());
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(finalDocs[tkr]) {
            row = clearRow(row);
            
            for(var key in row) {
                if(row[key] != NO_VALUE) {
                    var nKey = 'cf_' + key;
                    
                    if(!finalDocs[tkr][nKey])
                        finalDocs[tkr][nKey] = [];
                        
                    if(!prevCF[tkr] || prevCF[tkr][key] != row[key])
                        finalDocs[tkr][nKey][currWkIndex] = row[key];
                }
            }
            
            prevCF[tkr] = row;
        }
    });
    
    var docs = db.snt.find({ date:currDate });
    //print("Denorm SNT: " + docs.count());
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(finalDocs[tkr]) {
            row = clearRow(row);
            
            for(var key in row) {
                if(row[key] != NO_VALUE) {
                    var nKey = 'snt_' + key;
                    
                    if(!finalDocs[tkr][nKey])
                        finalDocs[tkr][nKey] = [];
                        
                    if(!prevSNT[tkr] || prevSNT[tkr][key] != row[key])
                        finalDocs[tkr][nKey][currWkIndex] = row[key];
                }
            }
            
            prevSNT[tkr] = row;
        }
    });
    
    if(i + 1 >= len)
        writeData(); //write last data
    
    /*var docs = db.dividend.find({ date:currDate });
    print("Denorm DIVIDEND: " + docs.count());
    docs.forEach(function(row) {
        var nRow = { dvp:row.amt, dvx:row.adate, dvt:row.type };
    	//printjson({ ticker:row.ticker, date:row.date });
    	//printjson(nRow);
    
        db.tickers.update({ ticker:row.ticker, date:row.date }, { $set:nRow });
    });
    */
}

print('End Denorm Financials:' + db.fsc.count());
