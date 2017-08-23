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
    labels: Float32Array; //[][]
    keys: string[];

    constructor(private dimensions: [number, number], inputArr?: number[] | Float32Array, private outputDimensions?: [number, number], outputArr?: number[] | Float32Array) {
        this.input = inputArr ? (inputArr instanceof Float32Array ? inputArr : new Float32Array(inputArr)) : new Float32Array(dimensions[0] * dimensions[1]);
        this.labels = outputDimensions ? (outputArr ? (outputArr instanceof Float32Array ? outputArr : new Float32Array(outputArr)) : new Float32Array(outputDimensions[0] * outputDimensions[1])) : null;
    }

    get(row: number, col: number) {
        return this.input[row*this.dimensions[1] + col];
    }

    set(row: number, col: number, val: number) {
        this.input[row*this.dimensions[1] + col] = val;
        //this.input.set([val], row*this.dimensions[1] + col);
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