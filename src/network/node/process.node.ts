require('../globals.js');

import { VirtualNodeService } from './basic/virtual-node.service';

import { Node } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

import { InitNodeProcessEvent, NodeProcessReadyEvent } from '../event/app.event';
import { AppEventQueue } from '../event/app-event-queue';

import { Network, NetworkTimings } from '../network';

declare var process;

export class ProcessNode {
    constructor() {
        AppEventQueue.global();
        Network.timings = new NetworkTimings();
        
        AppEventQueue.subscribe(InitNodeProcessEvent, 'process', event => {
            var node: Node = event.data.node;
            VirtualNodeService.pid = process.pid;

            var baseNode = new (NodeConfig.node(node.ntype))(node);
            baseNode.setOutputs(event.data.outputs);
            process.send(new NodeProcessReadyEvent(node._id));
            console.log('process:', process.pid, 'node:', node.name);
        });
    }
}

process.on('uncaughtException', function (exception) {
  console.log(exception);
  throw(exception);
});

new ProcessNode();
