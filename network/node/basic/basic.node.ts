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
            var startTime = Date.now();
            var error: Activation = new Activation([state.activation.rows(), state.activation.columns()]);

            for(var row = 0, len = state.activation.rows(); row < len; row++) {
                for(var oIndex = 0, olen = state.activation.columns(); oIndex < olen; oIndex++) {
                    var output = state.activation.get(row, oIndex);
                    var expected = event.data.output[row][oIndex];
                    
                    var delta = Network.costFunction.delta(output, expected);
                    this.totalCost += Network.costFunction.cost(output, expected);

                    error.set(row, oIndex, delta);
                    
                    if(Network.isLearning) {
                        this.calculateWeightError(state, row, oIndex, delta);
                    }             
                }

                this.totalCost = this.totalCost / state.activation.columns();
                this.trainingCount++;
            }
            
            Network.timings.cost += Date.now() - startTime;

            if(Network.isLearning) {
                this.backpropagate(new BackpropagateEvent({ error: error }, event.date));
            }
            else {
                this.notify(new BackpropagateCompleteEvent(null, event.date));
            }
        }
    }
}