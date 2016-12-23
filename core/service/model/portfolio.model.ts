import { Node, NodeType } from './node.model';

export class Portfolio extends Node {
    constructor(name: string) {
        super(NodeType.Portfolio);
        this.name = name;
    }
}