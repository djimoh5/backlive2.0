//import { AppEvent, BaseEvent } from 'backlive/network/event';

import { SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Indicator } from '../../../core/service/model/indicator.model';

interface ResponseEvent {
    res: () => void;
}