import {BaseNode} from '../base-node'

export declare type CacheResult = { [key: string]: {[key: string]: {[key: string]: number}} | {[key: string]: number} };
export declare type DataCache = {[key: number]: CacheResult};

export interface IDataHandler {
    init();
}

export class BaseDataHandler extends BaseNode implements IDataHandler {
    init() {};
}