//import { AppEvent, BaseEvent } from 'backlive/network/event';
//import { Strategy, LastPrice } from 'backlive/service/model';

import { AppEvent, BaseEvent } from '../../../network/event/base.event';
import { Strategy } from '../../../core/service/model/strategy.model';
import { LastPrice } from '../../../core/service/model/ticker.model';

@AppEvent('Event.ExecuteStrategy', true)
export class ExecuteStrategyEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.UpdateStrategy', true)
export class UpdateStrategyEvent extends BaseEvent<Strategy> {}

@AppEvent('Event.UserStrategies', true)
export class UserStrategiesEvent extends BaseEvent<Strategy[]> {}

interface ResponseEvent {
    res: () => void;
}