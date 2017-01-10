import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { ActivateNodeEvent, IndicatorEvent } from '../event/app.event';

import { BaseNode } from './base.node';
import { BasicNode } from './basic/basic.node';
import { VirtualNode } from './basic/virtual.node';
import { IndicatorNode } from './indicator/indicator.node';
import { StrategyNode } from './strategy/strategy.node';
import { PortfolioNode } from './portfolio/portfolio.node';

import { Node, NodeType } from '../../core/service/model/node.model';

export class NodeConfig {
    private static activationEventConfig: { [key: number]: typeof ActivateNodeEvent } = {
        [NodeType.Basic]: ActivateNodeEvent,
        [NodeType.Virtual]: ActivateNodeEvent,
        [NodeType.Indicator]: IndicatorEvent,
        [NodeType.Strategy]: ActivateNodeEvent
    };

    private static nodeConfig: { [key: number]: { new(node: Node): BaseNode<any>; } } = {
        [NodeType.Basic]: BasicNode,
        [NodeType.Virtual]: VirtualNode,
        [NodeType.Indicator]: IndicatorNode,
        [NodeType.Strategy]: StrategyNode,
        [NodeType.Portfolio]: PortfolioNode
    };

    static activationEvent(ntype: NodeType): typeof ActivateNodeEvent {
        return this.activationEventConfig[ntype];
    }

    static node(ntype: NodeType): { new(node: Node): BaseNode<any>; } {
        return this.nodeConfig[ntype];
    }
}
