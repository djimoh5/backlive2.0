/*db = db.getSiblingDB("btif");
var docs = db.tech.find();
print("Tech: " + docs.count());
docs.forEach(function(x){ db.tech_old.insert(x); });
print(db.tech_old.count());*/

/*db = db.getSiblingDB("btif");
var docs = db.tech_new.find();
print("Tech New: " + docs.count());
db.tech.drop();
print("Tech: " + db.tech.count());
docs.forEach(function(x){ db.tech.insert(x); });
print(db.tech.count());
db.tech.ensureIndex({ date:1, ticker:1 });
db.tech.ensureIndex({ ticker:1, date:1 });*/

db = db.getSiblingDB("btif");
var docs = db.tech_ohlc_d.find();
print("Tech OHLC D: " + docs.count());

print(db.tech_d.count());
docs.forEach(function(x) { 
    db.tech_d.update({ date:x.date, ticker:x.ticker }, { $set:{ open:x.open, high:x.high, low:x.low, close:x.close } });
});
print(db.tech_d.count());