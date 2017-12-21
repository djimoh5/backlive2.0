import { NodeService } from '../../../core/service/node.service';
import { Node } from '../../../core/service/model/node.model';

export class VirtualNodeService extends NodeService<Node> {
    static inputsByNode: { [key: string]: Node[] } = {};
    static pid: number;

    constructor(session: any) {
        super(session);
    }

    getInputs(nodeId: string) {
        setImmediate(() => {
            var inputs = VirtualNodeService.inputsByNode[nodeId];
            this.done(inputs ? inputs : []);
        });

        return this.promise;
    }

    static save(node: Node, nodes: Node[]) {
        this.inputsByNode[node._id] = nodes;
    }

    static reset() {
        this.inputsByNode = {};
    }
}