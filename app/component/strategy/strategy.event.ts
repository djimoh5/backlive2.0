//import { AppEvent, BaseEvent } from 'backlive/network/event';
//import { Strategy, LastPrice } from 'backlive/service/model';

import { AppEvent, BaseEvent } from '../../../network/event/base.event';
import { Strategy } from '../../../core/service/model/strategy.model';
import { LastPrice } from '../../../core/service/model/ticker.model';

@AppEvent('Event.Strategy.Change', true)
export class StrategyChangeEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.Strategy.Execute', true)
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.Strategy.Remove', true)
export class RemoveStrategyEvent extends BaseEvent<string> {}

interface ResponseEvent {
    res: () => void;
}