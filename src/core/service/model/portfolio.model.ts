import { Node, NodeType } from './node.model';

export class Portfolio extends Node {
    constructor() {
        super(NodeType.Portfolio);
    }
}