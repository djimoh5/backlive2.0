db = db.getSiblingDB("btiftemp");
print(db.is.count());
print(db.bs.count());
print(db.cf.count());
print(db.snt.count());
print(db.tickers.count());

print(db.tickers.findOne());
