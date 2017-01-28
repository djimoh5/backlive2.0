import { BasicNode } from './basic.node';

import { VirtualNodeService } from './virtual-node.service';
import { Node } from '../../../core/service/model/node.model';

export class VirtualNode extends BasicNode {
    constructor(model: Node) {
        super(model, VirtualNodeService);
    }
}