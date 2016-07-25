db = db.getSiblingDB("btiftemp");
var docs = db.is.find();
print("IS: " + docs.count());
db = db.getSiblingDB("btif");
print(db.is.count());
docs.forEach(function(x){ db.is.insert(x); });
print(db.is.count());

db = db.getSiblingDB("btiftemp");
var docs = db.is_gr.find();
print("IS GR: " + docs.count());
db = db.getSiblingDB("btif");
print(db.is_gr.count());
docs.forEach(function(x){ db.is_gr.insert(x); });
print(db.is_gr.count());

db = db.getSiblingDB("btiftemp");
var docs = db.bs.find();
print("BS: " + docs.count());
db = db.getSiblingDB("btif");
print(db.bs.count());
docs.forEach(function(x){ db.bs.insert(x); });
print(db.bs.count());

db = db.getSiblingDB("btiftemp");
var docs = db.cf.find();
print("CF: " + docs.count());
db = db.getSiblingDB("btif");
print(db.cf.count());
docs.forEach(function(x){ db.cf.insert(x); });
print(db.cf.count());

db = db.getSiblingDB("btiftemp");
var docs = db.snt.find();
print("SNT: " + docs.count());
db = db.getSiblingDB("btif");
print(db.snt.count());
docs.forEach(function(x){ db.snt.insert(x); });
print(db.snt.count());

db = db.getSiblingDB("btiftemp");
var docs = db.tickers.find();
print("TICKERS: " + docs.count());
db = db.getSiblingDB("btif");
print(db.tickers.count());
docs.forEach(function(x){ db.tickers.insert(x); });
print(db.tickers.count());

db = db.getSiblingDB("btiftemp");
var docs = db.file_date.find();
print("File Dates: " + docs.count());
db = db.getSiblingDB("btif");
print(db.file_date.count());
docs.forEach(function(x){ db.file_date.insert(x); });
print(db.file_date.count());

//ticker autocomplete
db = db.getSiblingDB("btiftemp");
var docs = db.tickers_ac.find();
print("Tickers AC: " + docs.count());
db = db.getSiblingDB("btif");
db.tickers_ac.remove({});
docs.forEach(function(x){ db.tickers_ac.insert(x); });
print(db.tickers_ac.count());

//add etfs to autocomplete
var docs = db.etf.find();
docs.forEach(function(x) { db.tickers_ac.insert({ t:x.ticker, n:x.name, etf:1 }); });
print(db.tickers_ac.count());
