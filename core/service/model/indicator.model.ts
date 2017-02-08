import { Node, NodeType } from './node.model';

export declare type IndicatorParam = [IndicatorParamType, string | number] | [IndicatorParamType, string | number, IndicatorParamTransform];

export class IndicatorParamGroup {
    vars: (IndicatorParam | IndicatorParamGroup)[] = [];
    ops: Operator[] = [];
}

export class Indicator extends Node {
    vars: (IndicatorParam | IndicatorParamGroup)[] = [];
    ops: Operator[] = [];
    
    allowNeg: number = 1;
    aggrType: string = 'val';
    aggrSpan: number = 6;
    aggrSpanType: number = 2;
    valType: number = 1;
    
    exclType: number = -1;
    exclOp: number = 2;
    excl: number = null;
    rankIndustry: boolean = false;
    
    //exp: number = 100;
    //expSh: number = 100;
    exitType: number = -1;
    exitOp: number = 1;
    exit: number = null;
    //threshOp: number = 1;
    //thresh: number = 1;

    constructor() {
        super(NodeType.Indicator);
    }
}

export class SportsIndicator extends Indicator {
    aggrType: string = 'avg';
    aggrSpan: number = 5;
    aggrSpanOpp: number = 0;
    
    player: string = 'a';
    playerSort: number = 1;
    playerNum: number = 1;
    
    exclIndTypes: number = 101;
}

export enum Operator {
    Add = 1,
    Subtract = 2,
    Multiply = 3,
    Divide = 4
}

export enum IndicatorParamType {
    Ticker = 0,
    IncomeStatement = 1, 
    BalanceSheet = 2, 
    CashFlowStatement = 3, 
    Statistic = 4, 
    Proprietary = 5, 
    Technicals = 6, 
    Macro = 7, 
    ShortInterest = 8, 
    FinancialStatement = 10, 
    FinancialIndicators = 11,
    Funds = 99,
    Constant = -1,
    Indicator = -2
}

export enum IndicatorParamTransform {
    AbsoluteValue = 1
}

export const DENORM_PARAM_TYPES: IndicatorParamType[] = [IndicatorParamType.IncomeStatement, IndicatorParamType.BalanceSheet, IndicatorParamType.CashFlowStatement, IndicatorParamType.Statistic];	
