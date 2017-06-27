export class Node {
    _id: string;
    uid: string;
    name: string = '';
    ntype: NodeType;

    inputs: string[];
    weights: Float32Array; //[][]
    bias: Float32Array; //[]
    
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
    private input: Float32Array; //[][]
    output: number[][]; //[][]
    keys?: string[];
    numRows: number;

    constructor(private dimensions: [number, number], private outputDimensions?: [number, number], inputArr?: number[]) {
        this.input = inputArr ? new Float32Array(inputArr) : new Float32Array(dimensions[0] * dimensions[1]);
        this.output = [];
    }

    get(row: number, col: number) {
        return this.input[row*this.dimensions[1] + col];
    }

    set(row: number, col: number, val: number) {
        this.input[row*this.dimensions[1] + col] = val;
    }

    data() {
        return this.input;
    }

    rows() {
        return this.dimensions[0];
    }

    columns() {
        return this.dimensions[1];
    }
}

export interface ActivationError {
    error: Activation;
    weights?: Float32Array; //[][]
}