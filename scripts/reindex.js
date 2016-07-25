db = db.getSiblingDB("btif");

//db.tickers.reIndex();
//db.fs.reIndex();
print('reindexing is');
db.is.reIndex();
print('reindexing bs');
db.bs.reIndex();
print('reindexing cf');
db.cf.reIndex();
print('reindexing snt');
db.snt.reIndex();