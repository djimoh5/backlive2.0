//import { AppEvent, BaseEvent } from 'backlive/network/event';
//import { Strategy, LastPrice } from 'backlive/service/model';

import { SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Strategy } from '../../../core/service/model/strategy.model';

@SocketEvent('Event.Strategy.Execute')
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}