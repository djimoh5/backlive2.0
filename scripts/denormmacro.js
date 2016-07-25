db = db.getSiblingDB("btif");
var dates = db.file_date.find().sort({ date:1 });
var NO_VALUE = -99999;

print('Start Denorm Macro:' + db.macroc.count());

function clearRow(row) {
    delete row._id;
    delete row.ticker;
    delete row.date;

    return row;
}

function writeData() {
    for(var tkr in finalDocs) {
        db.macroc.insert(finalDocs[tkr]);    
    }
    
    finalDocs = {};
    prevMacro = {};
}

var fullLoad = true;

var finalDocs = {}, prevMacro = {};
var prevYrMth, currWkIndex = 0;
var recentYrMth = (dates[dates.length() - 1].date + "").substring(0, 6);

print(recentYrMth);

if(!fullLoad) {
    //remove data for current month
    db.macroc.remove({ date:recentYrMth });
}
else
    db.macroc.remove({});

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
    
    var docs = db.macro.find({ date:currDate });
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(!finalDocs[tkr])
            finalDocs[tkr] = { ticker:tkr, date:currYrMth };

        row = clearRow(row);
            
        //add each key ONLY if value does not match previous week
        for(var key in row) {
            if(key.substring(0, 3) != 'dt_' && row[key] != NO_VALUE) {
                var nKey = key;
                
                if(!finalDocs[tkr][nKey])
                    finalDocs[tkr][nKey] = [];
                    
                if(!prevMacro[tkr] || prevMacro[tkr][key] != row[key])
                    finalDocs[tkr][nKey][currWkIndex] = row[key];
            }
        }
        
        prevMacro[tkr] = row;
    });
    
    if(i + 1 >= len)
        writeData(); //write last data
}

print('End Denorm Macro:' + db.macroc.count());
