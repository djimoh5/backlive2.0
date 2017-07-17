
import { AppEvent, SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Network } from 'backlive/service/model';

@SocketEvent('Event.Network.Load')
export class LoadNetworkEvent extends BaseEvent<Network> {}

@SocketEvent('Event.Network.Execute')
export class ExecuteNetworkEvent extends BaseEvent<Network> {}

@AppEvent('Event.Network.Redraw')
export class RedrawNodeEvent extends BaseEvent<string> {}