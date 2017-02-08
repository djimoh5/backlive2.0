import { BaseNode } from '../base.node';
import { ActivateNodeEvent, TrainingDataEvent, BackpropagateEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node, Activation } from '../../../core/service/model/node.model';

import { Network } from '../../network';

export class BasicNode extends BaseNode<Node> {
    trainingData: { input: number[][], output: { [key: string]: number } };

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
            var error: Activation;
            for(var key in this.state.activation) {
                error[key] = Network.costFunction.delta(this.state.activation[key], this.trainingData.output[this.node._id]);
                break; //should only be one key for basic node
            }

            this.backpropagate(new BackpropagateEvent({ error: error }, event.date));
        }
    }
}