import { BasicNode } from './basic/basic.node';

import { Node, NodeType } from '../../core/service/model/node.model';

import { VirtualNodeService } from './basic/virtual-node.service';

export class NetworkLayerNode extends BasicNode {
    nodes: Node[] = [];

    constructor(numNodes: number, namePrefix: string = 'virtual') {
        super(null, VirtualNodeService);

        this.node = new Node(NodeType.Virtual);
        this.node._id = this.nodeId;
        this.node.name = namePrefix;
        this.numNodes = numNodes;
        
        /*for(var i = 0; i < numNodes; i++) {
            var model = new Node(NodeType.Virtual);
            model._id = Common.uniqueId();
            model.name = namePrefix + (i + 1);
            this.nodes.push(model);
        }*/
    }

    setInputs(nodes: Node[]) {
        var inputs: string[] = nodes.map(input => { return input._id; });
        this.node.inputs = inputs;

        VirtualNodeService.save(this.node, nodes);

        /*this.nodes.forEach(node => {
            node.inputs = inputs;
            VirtualNodeService.save(node, nodes);
        });*/
    }
}