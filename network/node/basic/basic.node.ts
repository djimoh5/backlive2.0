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
            var error: Activation = new Activation();

            for(var row = 0, input: number[]; input = state.activation.input[row]; row++) {
                var outputErrs: number[] = [];

                for(var oIndex = 0, output: number; output = input[oIndex]; oIndex++) {
                    var delta = Network.costFunction.delta(output, event.data.output[row][oIndex + this.layerIndex]);
                    outputErrs[oIndex] = delta;
                    this.totalCost += Network.costFunction.cost(output, event.data.output[row][oIndex + this.layerIndex]);

                    if(Network.isLearning) {
                        this.calculateWeightError(state, row, oIndex, delta);
                    }             
                }

                error.input[row] = outputErrs;

                this.totalCost = this.totalCost / state.activation.input[0].length; //num outputs
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