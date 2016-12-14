import { Config } from '../config';
var MongoClient = require('mongodb').MongoClient;

export class Database {
    //private static IP: string = '23.23.204.60';
    private static IP: string = '127.0.0.1';

    static mongo: Mongo = null;
    static mongoPricing: Mongo = null;

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

export interface Mongo {
    collection: (name: string, callback?: (err, collection: Collection) => void) => Collection;
}

export interface Collection {
    find(query?: { [key: string]: any }, callback?: (err, results) => void);
    find(query?: { [key: string]: any }, fields?: { [key: string]: any }, callback?: (err, results) => void);
    find(query?: { [key: string]: any }, fields?: { [key: string]: any }, hint?: { hint: { [key: string]: number } }, callback?: (err, results) => void);
    findOne(query: { [key: string]: any }, callback: (err, doc) => void);
    findOne(query: { [key: string]: any }, fields: { [key: string]: any }, callback: (err, doc) => void);
    insert(data: any, callback?: (err) => void);
    insert(data: any, { safe: boolean }, callback?: (err) => void);
    update(query: { [key: string]: any }, data: { $set: any } | any, callback?: (err) => void);
    update(query: { [key: string]: any }, data: { $set: any } | any, options: { upsert?: boolean, multi?: boolean }, callback?: (err) => void);
    remove(query: { [key: string]: any }, callback?: (err) => void);
}

export interface QueryResults {
    (err: any, results: any);
}