import { BaseNode } from '../base.node';
import { Node, NodeType } from '../../../core/service/model/node.model';

export declare type ParamValues = { date: number; ticker: string; [key: string]: number | string };
export declare type DataResult = { [key: string]: ParamValues };
export declare type DateDataResult = { [key: number]: { [key: string]: ParamValues } };
export declare type DataCache = { [key: number]: DataResult }; //number = IndicatorParamType

export interface IDataNode {
    load(callback: (data: TrainingData) => void);
    init();
}

export abstract class BaseDataNode extends BaseNode<Node> implements IDataNode {
    constructor() {
        super(new Node(NodeType.Virtual));
        this.node.name = 'dataNode';
    }
    
    abstract load(callback: (data: TrainingData) => void);
    abstract init();
    abstract execute();

    receive() {};
}

export interface TrainingData {
    input: number[] | Float32Array; //[][]
    output: number[] | Float32Array; //[][]
}