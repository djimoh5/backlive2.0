//import { AppEvent, BaseEvent } from 'backlive/network/event';
//import { Strategy, LastPrice } from 'backlive/service/model';

import { AppEvent, BaseEvent } from '../../../../../network/event/base.event';
import { Strategy } from '../../../../../core/service/model/strategy.model';

@AppEvent('Event.Strategy.Execute')
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}