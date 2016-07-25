db = db.getSiblingDB("sports");
var docs = db.nba_bet.distinct('ticker')
print("Unique Tickers " + docs.count());

docs.forEach(function(x) { 
    var z = db.nba_bet.findOne({ ticker:x }); 
    db.tickers_ac.insert({ t:z.ticker, n:z.name }); 
});