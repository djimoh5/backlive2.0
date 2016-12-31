import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { ActivateNodeEvent, IndicatorEvent, StrategyEvent } from '../event/app.event';

import { BaseNode } from './base.node';
import { GenericNode } from './generic/generic.node';
import { IndicatorNode } from './indicator/indicator.node';
import { StrategyNode } from './strategy/strategy.node';

import { Node, NodeType } from '../../core/service/model/node.model';

export class NodeConfig {
    private static activationEventConfig: { [key: number]: typeof ActivateNodeEvent } = {
        [NodeType.Generic]: ActivateNodeEvent,
        [NodeType.Indicator]: IndicatorEvent,
        [NodeType.Strategy]: StrategyEvent
    };

    private static nodeConfig: { [key: number]: { new(node: Node): BaseNode<any>; } } = {
        [NodeType.Generic]: GenericNode,
        [NodeType.Indicator]: IndicatorNode,
        [NodeType.Strategy]: StrategyNode
    };

    static activationEvent(ntype: NodeType): typeof ActivateNodeEvent {
        return this.activationEventConfig[ntype];
    }

    static node(ntype: NodeType): { new(node: Node): BaseNode<any>; } {
        return this.nodeConfig[ntype];
    }
}
