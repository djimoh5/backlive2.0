import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from '../event/base.event';
import { ActivateNodeEvent, IndicatorEvent, StrategyEvent } from '../event/app.event';

import { NodeType } from 'backlive/service/model';

export class NodeConfig {
    static activationEvent(ntype: NodeType): typeof ActivateNodeEvent {
        var map: { [key: number]: typeof ActivateNodeEvent } = {
            [NodeType.Generic]: ActivateNodeEvent,
            [NodeType.Indicator]: IndicatorEvent,
            [NodeType.Strategy]: StrategyEvent
        };

        for(var key in map) {
            map[key].ntype = key;
        }
        return map[ntype];
    }
}