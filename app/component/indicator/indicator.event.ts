//import { AppEvent, BaseEvent } from 'backlive/network/event';

import { SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Indicator } from '../../../core/service/model/indicator.model';

@SocketEvent('Event.Indicator.Change')
export class IndicatorChangeEvent extends BaseEvent<Indicator> {}

@SocketEvent('Event.Indicator.Remove')
export class RemoveIndicatorEvent extends BaseEvent<string> {}

interface ResponseEvent {
    res: () => void;
}