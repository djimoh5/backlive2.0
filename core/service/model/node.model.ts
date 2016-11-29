export class Node {
    _id: string;
    uid: string;
    name: string = '';
    inputs: string[];
    weights: number[];
    ntype: NodeType;
    created: number;
    modified; number;
    
    constructor(type: NodeType) {
        this.ntype = type;
    }
}

export enum NodeType {
    Strategy = 0,
    Indicator = 1
}