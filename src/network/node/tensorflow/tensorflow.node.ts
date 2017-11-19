import { Node } from '../../../core/service/model/node.model';
import { NetworkLayerNode } from '../layer.node';
import { Activation } from '../../../core/service/model/node.model';
import { Network } from '../../network';
import { CostFunctionType } from '../../../core/service/model/network.model';

import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent } from '../../event/app.event';

export class TensorFlowNode extends NetworkLayerNode {
    trainData: Activation;

    constructor(numNodes: number) {
        super(numNodes, 'tensorflow');
    }

    receive(event: ActivateNodeEvent) {
        this.trainData = event.data;
        console.log('train:', this.trainData.rows());
        this.run();
    }

    private run() {
        console.log('running tensorflow...');
        this.send();
    }

    private send() {
        console.time('tensorflow-python')
        var trainBuffer = Buffer.from(<ArrayBuffer>this.trainData.data().buffer);
        var trainLblBuffer = Buffer.from(<ArrayBuffer>this.trainData.labels.buffer);
        var numClasses = this.trainData.labels.length / this.trainData.rows();
        var percentTestData = .20;

        try {
            require('../../add-ons/build/Release/tensorflow').tensorflow(
                trainBuffer, trainLblBuffer, this.trainData.rows(),
                this.trainData.columns(), numClasses, percentTestData,
                Network.network.learnRate,
                Network.network.epochs,
                Network.network.batchSize,
                Network.network.regParam,
                Network.network.costFunctionType || CostFunctionType.SoftMaxCrossEntropy,
                Buffer.from(<ArrayBuffer>new Int32Array(Network.network.hiddenLayers).buffer)
            );
        } catch(e) {
            console.log(e);
        }

        console.timeEnd('tensorflow-python');
    }
}