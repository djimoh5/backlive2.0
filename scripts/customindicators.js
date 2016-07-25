var fullLoad = false;
var NO_VALUE = -99999;

db = db.getSiblingDB("btif");
var dates = db.file_date.find().sort({ date:1 });

print('Start Build Custom Financial Indicators:' + db.fi.count());

var cache = [], lookback = 12;
var lastDate = dates[dates.length() - 1].date;

for(var i = (fullLoad ? 0 : (dates.length() - 57)), len = dates.length(); i < len; i++) { //60 week lookback
    var currDate = dates[i].date;
    var currWk = dates[i].wk;
    var fs = {};
    
    if(!fullLoad && currWk != 1 && currDate != lastDate)
        continue;
        
    print(currDate);

    var fields = { ticker:1, 'cf_tco':1, 'cf_dep_cf':1, 'bs_assets':1, 'bs_equity':1, 'bs_pref':1, 'bs_liab':1, 'bs_ltdebt':1, 'bs_ca':1, 'bs_cl':1, 'bs_ar':1, 'bs_nppe':1, 'bs_olta':1, 'is_netinc':1, 'is_iac':1, 'is_gross':1, 'is_sales':1, 'is_gopinc':1, 'is_rd':1, 'is_int':1, 'is_intno':1, 'is_rd':1, 'is_dep':1, 'is_uninc':1, 'is_pti':1, 'snt_shr_ay1':1, 'snt_mktcap':1 };

    var docs = db.fs.find({ date:currDate }, fields);
    docs.forEach(function(row) {
        fs[row.ticker] = row;
        var result = { ticker:row.ticker, date:currDate };
        
        if(cache.length >= lookback && (fullLoad || currDate == lastDate)) {
            var f = fscore(row);
            var m = mscore(row);
            var z = zscore(row);
        
            if(isNumber(f)) result.fscore = f;
            if(isNumber(m)) result.mscore = m;
            if(isNumber(z)) result.zscore = z;
            
            //print(currDate, f, m, z);
        }
        
        if(result.fscore || result.mscore || result.zscore) {
            /*var nRow = {};
            for(var key in result) {
                if(key != 'ticker' && key != 'date')
                    nRow['fi_' + key] = result[key];
            }*/
            //printjson(nRow);
            
            db.fi.insert(result);
            //db.fs.update({ date:result.date, ticker:result.ticker }, { $set:nRow });
        }
    });
    
    if(currWk == 1) {
        if(cache.length >= lookback)
            cache.shift();
            
        cache[cache.length] = fs;
    }
}

function fscore(data) {
    var prevData = cache[cache.length - lookback][data.ticker];
    
    if(!prevData)
        return null;
    
	var fields = ['is_netinc', 'cf_tco', 'bs_assets', 'is_iac', 'bs_ltdebt', 'bs_ca', 'bs_cl', 'snt_shr_ay1', 'is_gross', 'is_sales'];
    if(!validFields(fields, data, prevData))
        return null;
	
	var score = 0;
	
	if(data['is_netinc'] > 0) //Net Income – Score 1 if there is positive net income in the current year.
		score++;
		
	if(data['cf_tco'] > 0) //Operating Cash Flow – Score 1 if there is positive cashflow from operations in the current year.
		score++;
		
	if((data['is_netinc'] / data['bs_assets']) > (prevData['is_netinc'] / prevData['bs_assets'])) //Return on Assets – Score 1 if the ROA is higher in the current period compared to  the previous year.
		score++;	
	
	if(data['cf_tco'] > data['is_iac']) //Quality of Earnings – Score 1 if the cash flow from operations exceeds net income before extraordinary items.
		score++;
		
	if((data['bs_ltdebt'] / data['bs_assets']) < (prevData['bs_ltdebt'] / prevData['bs_assets'])) //Decrease in leverage – Score 1 if there is a lower ratio of long term debt to in the current period compared value in the previous year .
		score++;
	
	if((data['bs_ca'] / data['bs_cl']) > (prevData['bs_ca'] / prevData['bs_cl'])) //Increase in liquidity – Score 1 if there is a higher current ratio this year compared to the previous year.
		score++;
		
	if(data['snt_shr_ay1'] <= prevData['snt_shr_ay1']) //Absence of Dilution – Score 1 if the Firm did not issue new shares/equity in the preceding year.
		score++;
	
	if((data['is_gross'] / data['is_sales']) > (prevData['is_gross'] / prevData['is_sales'])) //Score 1 if there is a higher gross margin compared to the previous year.
		score++;
			
	if((data['is_sales'] / data['bs_assets']) > (prevData['is_sales'] / prevData['bs_assets'])) //Asset Turnover – Score 1 if there is a higher asset turnover ratio year on year (as a measure of productivity).
		score++;
		
	return score;
}

function mscore(data) {
    var prevData = cache[cache.length - lookback][data.ticker];
    
    if(!prevData)
        return null;
    
    var fields = ['bs_ar', 'is_sales', 'is_gross', 'bs_ca', 'bs_nppe', 'bs_olta', 'bs_assets', 'cf_dep_cf', 'is_gopinc', 'is_rd', 'is_int', 'is_rd', 'is_dep', 'is_uninc', 'bs_cl', 'bs_ltdebt', 'is_iac', 'cf_tco'];
    if(!validFields(fields, data, prevData))
        return null;
        
    var DSRI = (data['bs_ar'] / data['is_sales']) / (prevData['bs_ar'] / prevData['is_sales']); //(Net Receivablest / Salest) / Net Receivablest-1 / Salest-1)
	var GMI = (prevData['is_gross'] / prevData['is_sales']) / (data['is_gross'] / data['is_sales']); //[(Salest-1 - COGSt-1) / Salest-1] / [(Salest - COGSt) / Salest] 
	var AQI = (1 - ((data['bs_ca'] + data['bs_nppe'] + data['bs_olta']) / data['bs_assets'])) / (1 - ((prevData['bs_ca'] + prevData['bs_nppe'] + prevData['bs_olta']) / prevData['bs_assets'])); // [1 - (Current Assetst + PP&Et + Securitiest) / Total Assetst] / [1 - ((Current Assetst-1 + PP&Et-1 + Securitiest-1) / Total Assetst-1)]
	var SGI = data['is_sales'] / prevData['is_sales'];
	var DEPI = (prevData['cf_dep_cf'] / (prevData['bs_nppe'] + prevData['cf_dep_cf'])) / (data['cf_dep_cf'] / (data['bs_nppe'] + data['cf_dep_cf'])); //(Depreciationt-1/ (PP&Et-1 + Depreciationt-1)) / (Depreciationt / (PP&Et + Depreciationt))
	var SGAI = ((data['is_gross'] - data['is_gopinc'] - data['is_rd'] - data['is_int'] - data['is_dep'] - data['is_uninc']) / data['is_sales']) / ((prevData['is_gross'] - prevData['is_gopinc'] - prevData['is_rd'] - prevData['is_int'] - prevData['is_dep'] - prevData['is_uninc']) / prevData['is_sales']); //SGAI = (SG&A Expenset / Salest) / (SG&A Expenset-1 / Salest-1)
	var LVGI = ((data['bs_cl'] + data['bs_ltdebt']) / data['bs_assets']) / ((prevData['bs_cl'] + prevData['bs_ltdebt']) / prevData['bs_assets']); //[(Current Liabilitiest + Total Long Term Debtt) / Total Assetst] / [(Current Liabilitiest-1 + Total Long Term Debtt-1) / Total Assetst-1]
	var TATA = (data['is_iac'] - data['cf_tco']) / data['bs_assets']; //(Income from Continuing Operationst - Cash Flows from Operationst) / Total Assetst
	
	if(!isNumber(DEPI))
	    DEPI = 1;
	    
	if(!isNumber(AQI))
	    AQI = 1;
	    
	//print(DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA);

	var score = -4.840 + (0.920 * DSRI) + (0.528 * GMI) + (0.404 * AQI) + (0.892 * SGI) + (0.115 * DEPI) - (0.172 * SGAI) - (0.327 * LVGI) + (4.697 * TATA);
    return score;
}

function zscore(data) {
    var fields = ['bs_ca', 'bs_cl', 'bs_assets', 'bs_equity', 'bs_pref', 'is_pti', 'is_int', 'is_intno', 'snt_mktcap', 'bs_liab', 'is_sales'];
    if(!validFields(fields, data))
        return null;
        
    var A = (data['bs_ca'] - data['bs_cl']) / data['bs_assets']; //Working Capital/Total Assets
    var B = (data['bs_equity'] - data['bs_pref']) / data['bs_assets']; //Retained Earnings/Total Assets
    var C = (data['is_pti'] + data['is_int'] + data['is_intno']) / data['bs_assets']; //Earnings Before Interest & Tax/Total Assets
    var D = data['snt_mktcap'] / data['bs_liab']; //Market Value of Equity/Total Liabilities
    var E = data['is_sales'] / data['bs_assets']; //Sales/Total Assets

    var score = (1.2 * A) + (1.4 * B) + (3.3 * C) + (0.6 * D) + (1.0 * E);
    return score;
}

function validValue(val) {
    return typeof(val) != 'undefined' && val != NO_VALUE;
}

function validFields(fields, data, prevData) {
    for(var i = 0, len = fields.length; i < len; i++) {
	    if(!validValue(data[fields[i]]) || (prevData && !validValue(prevData[fields[i]])))
	        return false;
	}
	
	return true;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
print('End Build Custom Financial Indicators:' + db.fi.count());
