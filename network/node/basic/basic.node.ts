import { BaseNode } from '../base.node';
import { ActivateNodeEvent, TrainingDataEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node, Activation } from '../../../core/service/model/node.model';

import { Network } from '../../network';

import { TrainingData } from '../data/data.node';

export class BasicNode extends BaseNode<Node> {
    trainingData: TrainingData;

    constructor(private model: Node, nodeService?: typeof NodeService) {
        super(model, nodeService ? nodeService : NodeService);
        
        this.subscribe(TrainingDataEvent, event => this.processData(event));
    }

    processData(event: TrainingDataEvent) {
        console.log('Node ' + this.nodeId + ' received training data event');
        this.trainingData = event.data;
    }

    receive(event: ActivateNodeEvent) {
        //console.log(this.node._id, 'Basic node received an event from ', event.senderId);
        this.activate();

        if(this.state.activation && this.numOutputs() === 0) {
            var error: Activation = new Activation();
            this.state.activation.vals.forEach((input, index) => {
                var sigPrime = input[0] * (1 - input[0]);
                error.vals.push([Network.costFunction.delta(input[0], this.trainingData.output[index][0]) * sigPrime]);
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