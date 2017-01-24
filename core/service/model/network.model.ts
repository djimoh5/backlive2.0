import { Node, NodeType } from './node.model';

export class Network extends Node {
    learnRate: number;
    epochs: number;
    regParam: number; //regularization parameter
    hiddenLayers: HiddenLayer[];

    constructor(learningRate: number, numEpochs: number, hiddenNodes: number[], regParam: number) {
        super(NodeType.Network);
        this.learnRate = learningRate;
        this.epochs = numEpochs;
        this.regParam = regParam

        if(hiddenNodes) {
            this.hiddenLayers = [];
            hiddenNodes.forEach(cnt => {
                this.hiddenLayers.push({ numNodes: cnt, weights: [] });
            });
        }
    }
}

export interface HiddenLayer {
    numNodes: number;
    weights: number[][]; //[node][weights]
}