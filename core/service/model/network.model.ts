import { Node, NodeType } from './node.model';

export class Network extends Node {
    constructor(public learnRate: number, public epochs: number, public batchSize: number, public regParam: number, public hiddenLayers: number[]) {
        super(NodeType.Network);
    }
}