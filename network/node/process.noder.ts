/// <reference path="../../typings/index.d.ts" />

require('../globals.js');

import { BaseNode } from './base.node';
import { VirtualNodeService } from './basic/virtual-node.service';

import { Node } from '../../core/service/model/node.model';
import { NodeConfig } from './node.config';

import { InitNodeProcessEvent } from '../event/app.event';
import { AppEventQueue } from '../event/app-event-queue';

export class ProcessNode {
    node: BaseNode<Node>;

    constructor() {
        console.log(process.pid);
        AppEventQueue.global();
        //BaseNode.isVirtual = true;
        console.log(process.pid);
        
        AppEventQueue.subscribe(InitNodeProcessEvent, 'process', event => {
            var node: Node = event.data.node;
            VirtualNodeService.save(node, event.data.inputNodes);

            this.node = new (NodeConfig.node(node.ntype))(node);
            console.log('process:', process.pid, 'node:', node._id);
        });
    }
}

new ProcessNode();
