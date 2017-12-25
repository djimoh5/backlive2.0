
import { AppEvent, BaseEvent } from '../../../../../network/event/base.event';

@AppEvent('Event.Crypto.ProductChange')
export class CryptoProductChangeEvent extends BaseEvent<string> {}