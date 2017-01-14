import { BaseNode } from '../base.node'
import { ActivateNodeEvent, TrainingDataEvent, BackpropagateEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node, Activation } from '../../../core/service/model/node.model';

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
        console.log(this.numOutputs(), this.node._id, event.senderId, this.node.inputs);

        if(this.state.activation && this.numOutputs() === 0) {
            var error: Activation;
            for(var key in this.state.activation) {
                error[key] = this.costDelta(this.state.activation[key], this.trainingData.output[this.node._id]);
                break; //should only be one key for basic node
            }

            this.backpropagate(new BackpropagateEvent({ error: error }) )
        }
    }

    //PULL THIS OUT INTO SEPARATE CLASS
    cost(output: number, target: number) {
        return .5 * Math.pow(output - target, 2);
    }

    costDerivative(output: number, target: number) {
        return output - target;
    }

    costDelta(output: number, target: number) {
        //in our case output is sigmoid so can use it directly to calculate sig prime: sig * (1 - sig)
        return this.costDerivative(output, target) * (output * (1 - output));
    }
}