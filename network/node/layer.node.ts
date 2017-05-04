import { BaseNode, State } from './base.node';
import { ActivateNodeEvent, BackpropagateEvent } from '../event/app.event';

import { Node, NodeType } from '../../core/service/model/node.model';

import { VirtualNodeService } from './basic/virtual-node.service';

import { Common } from '../../app//utility/common';

export class NetworkLayerNode extends BaseNode<Node> {
    nodes: Node[] = [];

    constructor(numNodes: number) {
        super(null, VirtualNodeService);

        this.node = new Node(NodeType.Virtual);
        this.node._id = Common.uniqueId();

        //VirtualNodeService.save(node, inputNodes);
        //this.setNode(node);
        
        for(var i = 0; i < numNodes; i++) {
            var model = new Node(NodeType.Virtual);
            model._id = Common.uniqueId();
            model.name = 'hidden' + (i + 1);
            this.nodes.push(model);
        }
    }

    setInputs(nodes: Node[]) {
        var inputs: string[] = nodes.map(input => { return input._id; });
        this.node.inputs = inputs;

        this.nodes.forEach(node => {
            node.inputs = inputs;
            VirtualNodeService.save(node, nodes);
        });
    }

    receive(event: ActivateNodeEvent) {
        for(var i = 0, len = this.node.inputs.length; i < len; i++) {
            if(!this.state.inputActivations[this.node.inputs[i]]) {
                this.state.activation = null;
                return; //must first have an activation of all inputs to activate yourself
            }
        }

        //console.log('hidden layer received activation');
        this.state = new State();
    }

    backpropagate(event: BackpropagateEvent) {
        //console.log('hidden layer received backpropagation');
    }

    updateWeights(learningRate: number) {
        //console.log('hidden layer received updateWeights');
    }
}