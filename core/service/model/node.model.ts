export class Node {
    _id: string;
    uid: string;
    name: string = '';
    ntype: NodeType;

    inputs: string[];
    weights: number[];
    
    created: number;
    modified; number;

    //only set during execution
    activation?: Activation;
    activationError?: ActivationError;
    
    //client-side only
    position: { x: number, y: number };
    
    constructor(type: NodeType) {
        this.ntype = type;
    }
}

export enum NodeType {
    Basic = 1,
    Indicator = 2,
    Strategy = 3,
    Portfolio = 4
}

export interface Activation {
    [key: string]: number
}

export interface ActivationError {
    error: { [key: string]: number },
    weights?: { [key: string]: number } //nodeId => weight
}