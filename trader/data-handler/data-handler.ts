import {EventQueue} from '../lib/events/event-queue';

export declare type CacheResult = { [key: string]: {[key: string]: {[key: string]: number}} | {[key: string]: number} };
export declare type DataCache = {[key: number]: CacheResult};

export interface IDataHandler {
    init();
}

export class BaseDataHandler extends EventQueue implements IDataHandler {
    init() {};
}