import { BaseNode } from '../base.node';
import { Node } from '../../../core/service/model/node.model';

export interface IExecutionNode {
    
}

export class BaseExecutionNode extends BaseNode<Node> implements IExecutionNode {
    constructor() {
        super(null);
    }

    receive() {}
}