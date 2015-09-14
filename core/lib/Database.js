var Database = {
    MongoClient: require('mongodb').MongoClient,
    mongo: null,
    mongoPricing: null,
    open: function (callback) {
        Database.MongoClient.connect('mongodb://localhost:27017/' + MONGO_DB, { w: 1 }, function (err, db) {
            if (err) {
                console.log('Error occurred connecting to DB', MONGO_DB, err);
            } else {
                Database.mongo = db;
                Database.mongof = db;
                
                Database.MongoClient.connect('mongodb://localhost:27017/' + MONGO_PRICING_DB, { w: 1 }, function (err, dbPricing) {
                    if (err) {
                        console.log('Error occurred connecting to DB', MONGO_PRICING_DB, err);
                    } else {
                        Database.mongoPricing = dbPricing;
                        callback();
                    }
                });
            }
        });
    }
}

module.exports = Database;