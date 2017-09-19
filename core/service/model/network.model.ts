import { Node, NodeType } from './node.model';

export class Network extends Node {
    constructor(public learnRate: number, public epochs: number, public batchSize: number, public regParam: number, public hiddenLayers: number[], public costFunctionType: CostFunctionType = 1) {
        super(NodeType.Network);
    }
}

export enum CostFunctionType {
    SoftMaxCrossEntropy = 1,
    SigmoidCrossEntropy = 2,
    Quadratic = 3
}