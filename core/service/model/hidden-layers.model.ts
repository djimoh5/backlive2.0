import { Node, NodeType } from './node.model';

export class HiddenLayers extends Node {
    layer: HiddenLayer[];
    config: number[];

    constructor(config: number[]) {
        super(NodeType.Hidden);
    }
}

export class HiddenLayer {
    weights: number[][]; //[layer][node]
}