import { BaseRepository, Operations, Context } from './base.repository';
import { Node, NodeType } from '../service/model/node.model';
export { Node, NodeType } from '../service/model/node.model';
var Q = require('q');

export abstract class NodeRepository<T extends Node> extends BaseRepository {
    protected context: NodeContext<T>;
    protected nodeContext: Context;
    
    constructor(ntype?: NodeType) {
        super('node');
        this.nodeContext = this.context;
        this.context = new NodeContext(this.nodeContext, ntype ? ntype : NodeType.Basic);
    }

    getByUserId(userId: string) : Promise<T[]> {
        return this.context.find({ uid: userId }, null, { sort: { "_id": 1 } });
    }

    getById(nodeId: string) : Promise<T> {
        return this.context.findOne({ _id: this.dbObjectId(nodeId) });
    }

    add(data: T) : Promise<T> {
        data.created = new Date().getTime();
        data.modified = data.created;
        return this.context.insert(data, true);
    }

    update(data: T) : Promise<T> {
        data.modified = new Date().getTime();
        return this.context.update({ _id: this.dbObjectId(data._id), uid: data.uid }, data);
    }
    
    remove(userId: string, nodeId: string) : Promise<boolean> {
        return this.context.remove({ _id: this.dbObjectId(nodeId), uid: userId });
    }

    getInputs(userId: string, nodeId: string) : Promise<T[]> {
        var deferred = Q.defer();

        this.context.findOne({ _id: this.dbObjectId(nodeId), uid: userId }).then((node: Node) => {
            if(node.inputs) {
                var ids = node.inputs.map(id => { return this.dbObjectId(id); });
                this.nodeContext.find({ _id: { $in: ids } }).then((nodes: Node[]) => {
                    deferred.resolve(nodes);
                });
            }
            else {
                deferred.resolve([]);
            }
        });

        return deferred.promise;
    }
}

class NodeContext<T extends Node> extends Context {
    private ntype: NodeType;
    private nodeContext: Context;

    constructor(nodeContext: Context, ntype: NodeType) {
        super(nodeContext.getCollection());
        this.nodeContext = nodeContext;
        this.ntype = ntype;
    }

    find(query: { [key: string]: any }, fields?: { [key: string]: 1 }, operations?: Operations) : Promise<T[]> {
        query['ntype'] = this.ntype;
        return this.nodeContext.find(query, fields, operations);
    }

    insert(data: T, safe: boolean = false) : Promise<T> {
        if(typeof(data.ntype) === 'undefined') {
            throw("all nodes must have a node type set (ntype)");
        }
        else if(data.ntype !== this.ntype) {
            throw("node of type " + data.ntype + " cannot be inserted into repo of type " + this.ntype);
        }

        delete data.position;
        return this.nodeContext.insert(data, safe);
    }

    update(query: { [key: string]: any }, data: any) : Promise<T> {
        query['ntype'] = this.ntype;
        delete data.position;
        return this.nodeContext.update(query, data);
    }

    remove(query: { [key: string]: any }) : Promise<boolean> {
        query['ntype'] = this.ntype;
        return this.nodeContext.remove(query);
        //return Q.all([super.remove(query), this.nodeContext.remove(query)]);
    }
}