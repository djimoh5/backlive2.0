//import { AppEvent, BaseEvent } from 'backlive/network/event';
import { SocketEvent, BaseEvent } from '../../../network/event/base.event';
import { Node } from 'backlive/service/model';

@SocketEvent('Event.Node.Change')
export class NodeChangeEvent extends BaseEvent<Node> {}

@SocketEvent('Event.Node.Remove')
export class RemoveNodeEvent extends BaseEvent<string> {}