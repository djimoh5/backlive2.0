import { BaseNode, State } from './base.node';
import { ActivateNodeEvent, BackpropagateEvent } from '../event/app.event';

import { HiddenLayer } from '../../core/service/model/network.model';
import { Node, NodeType } from '../../core/service/model/node.model';

import { VirtualNodeService } from './basic/virtual-node.service';

import { Common } from '../../app//utility/common';

export class HiddenLayerNode extends BaseNode<Node> {
    nodes: Node[] = [];

    constructor(private hiddenLayer: HiddenLayer, inputNodes: { [key: string]: Node }) {
        super(null, VirtualNodeService);

        var node = new Node(NodeType.Virtual);
        node._id = Common.uniqueId();
        var inputs: string[] = [];

        for(var id in inputNodes) {
            inputs.push(id);
        }

        node.inputs = inputs;

        //VirtualNodeService.save(node, inputNodes);
        //this.setNode(node);
        
        for(var i = 0; i < hiddenLayer.numNodes; i++) {
            var model = new Node(NodeType.Virtual);
            model._id = Common.uniqueId();
            model.name = 'hidden' + (i + 1);
            model.inputs = inputs;

            VirtualNodeService.save(model, inputNodes);
            
            this.nodes.push(model); 
        }
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