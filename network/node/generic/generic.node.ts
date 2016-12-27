import { BaseNode } from '../base.node'
import { ActivateNodeEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node } from '../../../core/service/model/node.model';

export class GenericNode extends BaseNode<Node> {
    constructor(private model: Node) {
        super(model, NodeService);
    }

    receive(event: ActivateNodeEvent) {
        console.log('Generic node received an event', event);
    }
}