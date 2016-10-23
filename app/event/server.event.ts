import { AppEvent, BaseEvent } from 'backlive/network/event';
import { Strategy } from 'backlive/service/model';

@AppEvent('Event.ExecuteStrategy', true)
export class ExecuteStrategyEvent extends BaseEvent {
    constructor(data: Strategy) { super(data); }
}

@AppEvent('Event.StrategyUpdate', true)
export class StrategyUpdateEvent extends BaseEvent {
    constructor(data: number) { super(data); }
}