/// <reference path="../../typings/index.d.ts" />

require('../globals.js');

import { BaseNode } from './base.node';
import { VirtualNodeService } from './basic/virtual-node.service';

import { Node } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

import { InitNodeProcessEvent, NodeProcessReadyEvent } from '../event/app.event';
import { AppEventQueue } from '../event/app-event-queue';

import { Network } from '../network';
import { CostFunctionFactory } from '../lib/cost-function';

declare var process;

export class ProcessNode {
    node: BaseNode<Node>;

    constructor() {
        AppEventQueue.global();
        
        AppEventQueue.subscribe(InitNodeProcessEvent, 'process', event => {
            var node: Node = event.data.node;
            Network.costFunction = CostFunctionFactory.create(event.data.costType);
            VirtualNodeService.pid = process.pid;

            if(this.node) {
                this.node.unsubscribe();
            }

            this.node = new (NodeConfig.node(node.ntype))(node);
            this.node.setOutputs(event.data.outputs);
            process.send(new NodeProcessReadyEvent(node._id));
            console.log('process:', process.pid, 'node:', node.name);
        });
    }
}

new ProcessNode();
