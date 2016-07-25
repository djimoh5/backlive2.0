db = db.getSiblingDB("btitemp");

print("Rebuilding Indexes for IS");
db.is.ensureIndex({ date:1, ticker:1 });
db.is.ensureIndex({ date:1 });
db.is.ensureIndex({ ticker:1 });

print("Rebuilding Indexes for BS");
db.bs.ensureIndex({ date:1, ticker:1 });
db.bs.ensureIndex({ date:1 });
db.bs.ensureIndex({ ticker:1 });

print("Rebuilding Indexes for CF");
db.cf.ensureIndex({ date:1, ticker:1 });
db.cf.ensureIndex({ date:1 });
db.cf.ensureIndex({ ticker:1 });

print("Rebuilding Indexes for SNT");
db.snt.ensureIndex({ date:1, ticker:1 });
db.snt.ensureIndex({ date:1 });
db.snt.ensureIndex({ ticker:1 });

print("Rebuilding Indexes for TICKERS");
db.tickers.ensureIndex({ date:1, ticker:1 });
db.tickers.ensureIndex({ date:1 });
db.tickers.ensureIndex({ ticker:1 });
db.tickers.ensureIndex({ name:1 });