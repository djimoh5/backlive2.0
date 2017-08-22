/// <reference path="../../../typings/index.d.ts" />

import { Node } from '../../../core/service/model/node.model';
import { NetworkLayerNode } from '../layer.node';
import { Activation } from '../../../core/service/model/node.model';

import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent } from '../../event/app.event';

var addOn = require('../../add-ons/build/Release/tensorflow');

export class TensorFlowNode extends NetworkLayerNode {
    trainData: Activation;
    testData: Activation;

    constructor(numNodes: number) {
        super(numNodes, 'tensorflow');
    }

    receive(event: ActivateNodeEvent) {
        if(!this.trainData) {
            this.trainData = event.data;
            console.log('train:', this.trainData.rows());
        }
        else if(!this.testData) {
            this.testData = event.data;
            console.log('test:', this.testData.rows());
            this.run();
        }
    }

    private run() {
        console.log('running tensorflow...');
        this.send();
    }

    private send() {
        console.time('send')
        var trainBuffer = Buffer.from(this.trainData.data().buffer);
        var trainLblBuffer = Buffer.from(this.trainData.output.buffer);
        var testBuffer = Buffer.from(this.testData.data().buffer);
        var testLblBuffer = Buffer.from(this.testData.output.buffer);

        var numClasses = this.trainData.output.length / this.trainData.rows();

        try {
            addOn.tensorflow(
                trainBuffer, trainLblBuffer, this.trainData.rows(), this.trainData.columns(),
                testBuffer, testLblBuffer, this.testData.rows(), this.testData.columns(), numClasses
            );
        } catch(e) {
            console.log(e);
        }

        console.timeEnd('send');
    }
}