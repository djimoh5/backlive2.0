import { AppEvent, BaseEvent } from '../../network/event/base.event';
import { LastPrice } from '../../core/service/model/ticker.model';

@AppEvent('Event.Ticker.LastPrice', true)
export class TickerLastPriceEvent extends BaseEvent<{ [key: string]: LastPrice }> {}