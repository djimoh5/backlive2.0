import { BaseNode } from '../base.node'

export declare type ParamValues = { date: number; ticker: string;[key: string]: number | string };
export declare type DataResult = { [key: string]: ParamValues };
export declare type DateDataResult = { [key: number]: { [key: string]: ParamValues } };
export declare type DataCache = { [key: number]: DataResult }; //number = IndicatorParamType

export interface IDataNode {
    init();
}

export class BaseDataNode extends BaseNode implements IDataNode {
    init() { };
}