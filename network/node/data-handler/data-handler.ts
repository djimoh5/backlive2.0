import {BaseNode} from '../base-node'

export declare type ParamValue = {[key: string]: number};
export declare type CacheResult = { [key: string]: (ParamValue | {[key: string]: ParamValue}) };
export declare type DataCache = {[key: number]: CacheResult};

export interface IDataHandler {
    init();
}

export class BaseDataHandler extends BaseNode implements IDataHandler {
    init() {};
}