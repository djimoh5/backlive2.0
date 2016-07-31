import {EventQueue} from '../lib/events/event-queue';
import {Strategy} from '../strategy/strategy';

export class Portfolio extends EventQueue {
    strategy: Strategy;
}