/// <reference path="../../../typings/index.d.ts" />

import { Node } from '../../../core/service/model/node.model';
import { NetworkLayerNode } from '../layer.node';

import { ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent, UpdateNodeWeightsEvent } from '../../event/app.event';

export class TensorFlowNode extends NetworkLayerNode {
    constructor(numNodes: number) {
        super(numNodes, 'tensorflow');
    }

    receive(event: ActivateNodeEvent) {
        console.log('i\'m here bitches', event.data.data().length);
        var input = Array.prototype.slice.call(event.data.data());
        var output = Array.prototype.slice.call(event.data.output);

        var spawn = require('child_process').spawn,
            py = spawn('python', ['./mnist.py']);

        py.stdout.on('data', function(data) {
            console.log('yo yo network')
            console.log(data.toString());
        });

        py.stderr.on('data', function(data) {
            console.log(data.toString());
        });

        py.stdout.on('end', function() {});

        var inputStr = JSON.stringify(input) + '\n';
        var outputStr = JSON.stringify(output) + '\n';
        py.stdin.write(inputStr);
        py.stdin.write(outputStr);
        //py.stdin.end();
    }
}