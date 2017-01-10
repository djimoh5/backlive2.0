import { NodeService } from '../../../core/service/node.service';
import { Node } from '../../../core/service/model/node.model';

import { Common } from '../../../app//utility/common';

export class VirtualNodeService extends NodeService<Node> {
    static inputsByNode: { [key: string]: Node[] } = {};

    constructor(session: any) {
        super(session);
    }

    getInputs(nodeId: string) {
        setTimeout(() => {
            var inputs = VirtualNodeService.inputsByNode[nodeId];
            this.done(inputs ? inputs : []);
        });

        return this.promise;
    }

    static save(node: Node, inputNodes: { [key: string]: Node }) {
        var nodes: Node[] = [];
        for(var key in inputNodes) {
            nodes.push(this.cloneNode(inputNodes[key]));
        }

        this.inputsByNode[node._id] = nodes;
    }

    static reset() {
        this.inputsByNode = {};
    }

    private static cloneNode(node: Node) {
        var clone = new Node(node.ntype);
        for(var key in node) {
            clone[key] = node[key];
        }

        return clone;
    }
}