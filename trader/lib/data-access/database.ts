/// <reference path="../../../typings/index.d.ts" />

var IP = '23.23.204.60';
//var IP = 'localhost';
var MONGO_DB = "btif";
var MONGO_PRICING_DB = "pricing";

//import {MongoClient, ObjectID} from 'mongodb';
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

export class Database {
    static ObjectID = ObjectID;
    static mongo: any;
    static mongoPricing: any;
    
    static open(callback) {
        MongoClient.connect('mongodb://' + IP + ':27017/' + MONGO_DB, { w: 1 }, function (err, db) {
            if (err) {
                console.log('Error occurred connecting to DB', MONGO_DB, err);
            } else {
                Database.mongo = db;
                
                MongoClient.connect('mongodb://' + IP + ':27017/' + MONGO_PRICING_DB, { w: 1 }, function (err, dbPricing) {
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