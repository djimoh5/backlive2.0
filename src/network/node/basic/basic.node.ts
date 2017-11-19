import { BaseNode } from '../base.node';
import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { NodeService } from '../../../core/service/node.service';
import { Node, Activation } from '../../../core/service/model/node.model';
import { ISession } from '../../../core/lib/session';

import { Network } from '../../network';

var aoA = require('../../add-ons/build/Release/activate');

export class BasicNode extends BaseNode<Node> {
    constructor(private model: Node, nodeService?: new(session: ISession, nodeRepository?) => NodeService<any>) {
        super(model, nodeService ? nodeService : NodeService);
    }

    receive(event: ActivateNodeEvent) {
        this.activate();
        var state = this.pastState[event.date];

        if(state && this.numOutputs() === 0) {
            var startTime = Date.now();
            var delta: Activation = new Activation([state.activation.rows(), state.activation.columns()]);

            var totalCost = aoA.outputDelta(Buffer.from(<ArrayBuffer>delta.data().buffer), state.activation.data(), event.data.labels, 
                state.activation.rows(), Buffer.from(<ArrayBuffer>this.learningError.total.buffer), Buffer.from(<ArrayBuffer>this.learningError.totalBias.buffer), 
                state.inputActivations[this.node.inputs[0]].data());
            
            this.totalCost += totalCost;
            /*for(var row = 0, len = state.activation.rows(); row < len; row++) {
                for(var oIndex = 0, outputLen = state.activation.columns(); oIndex < outputLen; oIndex++) {
                    var output = state.activation.get(row, oIndex);
                    var expected = event.data.labels[row*outputLen + oIndex];

                    var deltaVal = Network.costFunction.delta(output, expected);
                    this.totalCost += Network.costFunction.cost(output, expected);

                    delta.set(row, oIndex, deltaVal);
                    
                    if(Network.isLearning) {
                        this.calculateWeightError(state, row, oIndex, deltaVal);
                    }             
                }
            }*/

            this.trainingCount += state.activation.rows();
            
            Network.timings.cost += Date.now() - startTime;

            if(Network.isLearning) {
                this.backpropagate(new BackpropagateEvent({ error: delta }, event.date));
            }
            else {
                this.notify(new BackpropagateCompleteEvent(null, event.date));
            }
        }
    }
}