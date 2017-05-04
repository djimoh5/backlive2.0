export class Node {
    _id: string;
    uid: string;
    name: string = '';
    ntype: NodeType;

    inputs: string[];
    weights: number[];
    bias: number;
    
    created: number;
    modified; number;

    //client-side only
    position: { x: number, y: number };
    
    constructor(type: NodeType) {
        this.ntype = type;
    }
}

export enum NodeType {
    Virtual = -1,
    Network = 1,
    Basic = 2,
    Indicator = 10,
    Strategy = 11,
    Portfolio = 12,
}

export class Activation {
    vals: number[][];
    keys?: string[];
    constructor() {
        this.vals = [];
    }
}

export interface ActivationError {
    error: Activation;
    weights?: { [key: string]: number }; //nodeId => weight
}