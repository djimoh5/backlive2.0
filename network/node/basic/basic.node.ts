import { BaseNode } from '../base.node';
import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node, Activation } from '../../../core/service/model/node.model';

import { Network } from '../../network';

export class BasicNode extends BaseNode<Node> {
    constructor(private model: Node, nodeService?: typeof NodeService) {
        super(model, nodeService ? nodeService : NodeService);
    }

    receive(event: ActivateNodeEvent) {
        //console.log(this.node._id, 'Basic node received an event from ', event.senderId);
        this.activate();
        var state = this.pastState[event.date];

        if(state && this.numOutputs() === 0) {
            var error: Activation = new Activation();
            state.activation.input.forEach((input, index) => {
                error.input.push([Network.costFunction.delta(input[0], event.data.output[index][this.layerIndex])]);
                this.totalCost += Network.costFunction.cost(input[0], event.data.output[index][this.layerIndex]);
                this.trainingCount++;
            });

            if(Network.isLearning) {
                this.backpropagate(new BackpropagateEvent({ error: error }, event.date));
            }
            else {
                this.notify(new BackpropagateCompleteEvent(null, event.date));
            }
        }
    }
}