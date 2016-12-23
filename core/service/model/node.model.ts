export class Node {
    _id: string;
    uid: string;
    name: string = '';
    inputs: string[];
    weights: number[];
    ntype: NodeType;
    created: number;
    modified; number;
    
    //client-side only
    position: { x: number, y: number };
    
    constructor(type: NodeType) {
        this.ntype = type;
    }
}

export enum NodeType {
    Generic = 1,
    Indicator = 2,
    Strategy = 3,
    Portfolio = 4
}

export interface Activation {
    [key: string]: number
}