//db = db.getSiblingDB("bti");
//db.tickers_c.remove()
//print("Compressed Tickers Cleared " + db.tickers_c.count());

db = db.getSiblingDB("btitemp");
var docs = db.is.find();
print("IS: " + docs.count());
db = db.getSiblingDB("bti");
print(db.is.count());
docs.forEach(function(x){ db.is.insert(x); });
print(db.is.count());

db = db.getSiblingDB("btitemp");
var docs = db.bs.find();
print("BS: " + docs.count());
db = db.getSiblingDB("bti");
print(db.bs.count());
docs.forEach(function(x){ db.bs.insert(x); });
print(db.bs.count());

db = db.getSiblingDB("btitemp");
var docs = db.cf.find();
print("CF: " + docs.count());
db = db.getSiblingDB("bti");
print(db.cf.count());
docs.forEach(function(x){ db.cf.insert(x); });
print(db.cf.count());

db = db.getSiblingDB("btitemp");
var docs = db.snt.find();
print("STAT: " + docs.count());
db = db.getSiblingDB("bti");
print(db.snt.count());
docs.forEach(function(x){ db.snt.insert(x); });
print(db.snt.count());

db = db.getSiblingDB("btitemp");
var docs = db.mos.find();
print("MOS: " + docs.count());
db = db.getSiblingDB("bti");
print(db.mos.count());
docs.forEach(function(x){ db.mos.insert(x); });
print(db.mos.count());

db = db.getSiblingDB("btitemp");
var docs = db.tickers.find();
print("TICKERS: " + docs.count());
db = db.getSiblingDB("bti");
print(db.tickers.count());
docs.forEach(function(x){ db.tickers.insert(x); });
print(db.tickers.count());

db = db.getSiblingDB("btitemp");
var docs = db.file_date.find();
print("File Dates: " + docs.count());
db = db.getSiblingDB("bti");
print(db.file_date.count());
docs.forEach(function(x){ db.file_date.insert(x); });
print(db.file_date.count());

/*db = db.getSiblingDB("tech");
var docs = db.tech.find();
print("Technicals: " + docs.count());
db = db.getSiblingDB("bti");
print(db.tech.count());
docs.forEach(function(x){ db.tech.insert(x); });
print(db.tech.count());*/

