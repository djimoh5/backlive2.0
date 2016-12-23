//import { AppEvent, BaseEvent } from 'backlive/network/event';
//import { Strategy, LastPrice } from 'backlive/service/model';

import { SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Strategy } from '../../../core/service/model/strategy.model';
import { LastPrice } from '../../../core/service/model/ticker.model';

@SocketEvent('Event.Strategy.Change')
export class StrategyChangeEvent extends BaseEvent<Strategy> {}

@SocketEvent('Event.Strategy.Execute')
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}

@SocketEvent('Event.Strategy.Remove')
export class RemoveStrategyEvent extends BaseEvent<string> {}