//import { AppEvent, BaseEvent } from 'backlive/network/event';
import { SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Network } from 'backlive/service/model';

@SocketEvent('Event.Network.Load')
export class LoadNetworkEvent extends BaseEvent<Network> {}

@SocketEvent('Event.Network.Execute')
export class ExecuteNetworkEvent extends BaseEvent<Network> {}

@SocketEvent('Event.Network.Redraw')
export class RedrawNetworkEvent extends BaseEvent<Network> {}