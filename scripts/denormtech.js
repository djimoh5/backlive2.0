db = db.getSiblingDB("btif");
var dates = db.file_date.find().sort({ date:1 });
var NO_VALUE = -99999;

print('Start Denorm Technicals:' + db.techc.count());

function clearRow(row) {
    delete row._id;
    delete row.ticker;
    delete row.date;

    return row;
}

function writeData() {
    for(var tkr in finalDocs) {
        db.techc.insert(finalDocs[tkr]);    
    }
    
    finalDocs = {};
    prevTech = {};
    prevShrt = {};
}

var fullLoad = false;

var finalDocs = {}, prevTech = {}, prevShrt = {};
var prevYrMth, currWkIndex = 0;
var recentYrMth = (dates[dates.length() - 1].date + "").substring(0, 6);

print(recentYrMth);

if(!fullLoad) {
    //remove data for current month
    db.techc.remove({ date:recentYrMth });
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
    
    var docs = db.tech.find({ date:currDate });
    //print("Denorm Tech: " + docs.count());
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(!finalDocs[tkr])
            finalDocs[tkr] = { ticker:tkr, date:currYrMth };

        row = clearRow(row);
            
        //add each key ONLY if value does not match previous week
        for(var key in row) {
            if(row[key] != NO_VALUE) {
                var nKey = 't_' + key;
                
                if(!finalDocs[tkr][nKey])
                    finalDocs[tkr][nKey] = [];
                    
                if(!prevTech[tkr] || prevTech[tkr][key] != row[key])
                    finalDocs[tkr][nKey][currWkIndex] = row[key];
            }
        }
        
        prevTech[tkr] = row;
    });

    var docs = db.shrt_intr.find({ date:currDate });
    //print("Denorm Short Interest: " + docs.count());
    docs.forEach(function(row) {
        var tkr = row.ticker;
        
        if(finalDocs[tkr]) {
            row = clearRow(row);
            
            for(var key in row) {
                if(row[key] != NO_VALUE) {
                    var nKey = 's_' + key;
                    
                    if(!finalDocs[tkr][nKey])
                        finalDocs[tkr][nKey] = [];
                        
                    if(!prevShrt[tkr] || prevShrt[tkr][key] != row[key])
                        finalDocs[tkr][nKey][currWkIndex] = row[key];
                }
            }
            
            prevShrt[tkr] = row;
        }
    });
    
    if(i + 1 >= len)
        writeData(); //write last data
}

print('End Denorm Technicals:' + db.techc.count());
