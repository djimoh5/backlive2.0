import { Config } from '../config';
var MongoClient = require('mongodb').MongoClient;

export class Database {
    private static IP: string = '23.23.204.60';
    //private static IP: string = 'localhost';

    static mongo: { collection: Function } = null;
    static mongoPricing: any = null;

    static ObjectID = require('mongodb').ObjectID;

    static open(callback) {
        MongoClient.connect('mongodb://' + Database.IP + ':27017/' + Config.MONGO_DB, { w: 1 }, function (err, db) {
            if (err) {
                console.log('Error occurred connecting to DB', Config.MONGO_DB, err);
            } else {
                Database.mongo = db;
                
                MongoClient.connect('mongodb://' + Database.IP + ':27017/' + Config.MONGO_PRICING_DB, { w: 1 }, function (err, dbPricing) {
                    if (err) {
                        console.log('Error occurred connecting to DB', Config.MONGO_PRICING_DB, err);
                    } else {
                        Database.mongoPricing = dbPricing;
                        callback();
                    }
                });
            }
        });
    }
}