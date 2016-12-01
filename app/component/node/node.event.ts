//import { AppEvent, BaseEvent } from 'backlive/network/event';
import { AppEvent, BaseEvent } from '../../../network/event/base.event';
import { Node } from 'backlive/service/model';

@AppEvent('Event.Node.Change', true)
export class NodeChangeEvent extends BaseEvent<Node> {}