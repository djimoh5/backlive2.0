/// <reference path="../../../typings/index.d.ts" />

import { Node } from '../../../core/service/model/node.model';
import { NetworkLayerNode } from '../layer.node';
import { Activation } from '../../../core/service/model/node.model';

import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent } from '../../event/app.event';

var aoA = require('../../add-ons/build/Release/activate');

export class TensorFlowNode extends NetworkLayerNode {
    trainData: Activation;
    testData: Activation;

    python: any;

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

        /*if(!this.python) {
            var spawn = require('child_process').spawn;
            this.python = spawn('python', ['../../add-ons/python/mnist.py']);
        }

        this.python.stdout.on('data', function(data) {
            console.log('yo yo network')
            console.log(data.toString());
        });

        this.python.stderr.on('data', function(data) {
            console.log(data.toString());
        });

        this.python.stdout.on('end', function() {});*/

        this.send(this.trainData);
        //this.send(this.testData);
    }

    private send(data: Activation) {
        //var input = Array.prototype.slice.call(data.data());
        //var output = Array.prototype.slice.call(data.output);

        //var inputStr = JSON.stringify(input) + '\n';
        //var outputStr = JSON.stringify(output) + '\n';

        console.time('send')
        var buffer = Buffer.from(data.data().buffer);
        console.log(buffer.length)
        //this.python.stdin.write(buffer);
        aoA.tensorflow(buffer);
        //this.python.stdin.write(Buffer.from(data.output.buffer));
        console.timeEnd('send');
    }
}