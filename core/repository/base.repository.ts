import { Database, Mongo, Collection } from '../lib/database';

var Q = require('q');

export class BaseRepository {
    protected context: Context;

    constructor(collectionName: string = null) {
        if(!collectionName) {
            throw('a collection name must be specified');
        }

        var collection = Database.mongo.collection(collectionName);
        this.context = new Context(collection);
    }

    dbObjectId(oid: string) {
        return new Database.ObjectID(oid);
    }
}

export class Context {
    protected collection: Collection;

    constructor(collection: Collection) {
        this.collection = collection;
    }

    getCollection() {
        return this.collection;
    }

    find(query: { [key: string]: any }, fields?: { [key: string]: 1 }, operations?: Operations) : Promise<any[]> {
        var deferred = Q.defer();
        var find = fields ? this.collection.find(query, fields) : this.collection.find(query);
        
        if(operations) {
            for(var key in operations) {
                find[key](operations[key]);
            }
        }

        find.toArray((err, results) => this.deferCallback(deferred, err, results));

        return deferred.promise;
    }

    findOne(query: { [key: string]: any }, fields?: { [key: string]: 1 }) : Promise<any> {
        var deferred = Q.defer();

        if(fields) {
            this.collection.findOne(query, fields, (err, doc) => this.deferCallback(deferred, err, doc));
        }
        else {
            this.collection.findOne(query, (err, doc) => this.deferCallback(deferred, err, doc));
        }

        return deferred.promise;
    }

    insert(data: any, safe: boolean = false) : Promise<any> {
        var deferred = Q.defer();
        this.collection.insert(data, { safe: safe }, (err) => this.deferCallback(deferred, err, data));
        return deferred.promise;
    }

    update(query: { [key: string]: any }, data: any) : Promise<any> {
        var deferred = Q.defer();
        var id = data._id;
        delete data._id;

        this.collection.update(query, { $set: data }, (err) => {
            if(id) {
                data._id = id;
            }

            this.deferCallback(deferred, err, data);
        });

        return deferred.promise;
    }

    remove(query: { [key: string]: any }) : Promise<any> {
        var deferred = Q.defer();
        this.collection.remove(query, (err) => this.deferCallback(deferred, err));
        return deferred.promise;
    }

    private deferCallback(deferred, err, results?) {
        if(err) { 
            deferred.reject(err); 
        }
        else {
            deferred.resolve(results);
        }
    }
}

export class Operations {
    sort: { [key: string]: 1|-1 }
}