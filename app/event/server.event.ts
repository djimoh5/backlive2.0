import { SocketEvent, BaseEvent } from '../../network/event/base.event';
import { LastPrice } from '../../core/service/model/ticker.model';

@SocketEvent('Event.Ticker.LastPrice')
export class TickerLastPriceEvent extends BaseEvent<{ [key: string]: LastPrice }> {}