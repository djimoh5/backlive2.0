import { BaseNode } from '../base.node'
import { ActivateNodeEvent, TrainingDataEvent, BackpropagateEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node } from '../../../core/service/model/node.model';

export class BasicNode extends BaseNode<Node> {
    trainingData: { input: number[][], output: { [key: string]: number } };

    constructor(private model: Node) {
        super(model, NodeService);
        
        this.subscribe(TrainingDataEvent, event => this.processData(event));
    }

    processData(event: TrainingDataEvent) {
        console.log('Node ' + this.nodeId + ' received training data event');
        this.trainingData = event.data;
    }

    receive(event: ActivateNodeEvent) {
        console.log('Basic node received an event', event);
        this.activate();

        if(this.node.activation && !this.hasOutputs()) {
            var error: number;
            for(var key in this.node.activation) {
                error = this.cost(this.node.activation[key], this.trainingData.output[this.node._id]);
                break; //should only be one key for basic node
            }

            this.backpropagate(new BackpropagateEvent({ error: error }) )
        }
    }

    cost(output: number, target: number) {
        return output - target;
    }
}