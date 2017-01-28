import { BaseNode } from '../base.node';

export interface IExecutionNode {
    
}

export class BaseExecutionNode extends BaseNode<null> implements IExecutionNode {
    constructor() {
        super(null);
    }

    receive() {}
}