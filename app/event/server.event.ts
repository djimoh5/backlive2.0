import { AppEvent, BaseEvent } from '../../network/event/base.event';
import { Strategy } from '../../core/service/model/strategy.model';
import { LastPrice } from '../../core/service/model/ticker.model';


@AppEvent('Event.TickerLastPrice', true)
export class TickerLastPriceEvent extends BaseEvent<{ [key: string]: LastPrice }> {}