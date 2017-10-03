import { booleanInt } from './shared.model';
import { Node, NodeType } from './node.model';

export declare type IndicatorParam = [IndicatorParamType, string | number] | [IndicatorParamType, string | number, IndicatorParamTransform];

export class IndicatorParamGroup {
    vars: (IndicatorParam | IndicatorParamGroup)[] = [];
    ops: Operator[] = [];
}

export class Indicator extends Node {
    vars: (IndicatorParam | IndicatorParamGroup)[] = [];
    ops: Operator[] = [];
    
    aggrType: AggregationType = AggregationType.Value;
    aggrSpan: number = 6;
    aggrPeriod: AggregationPeriod = AggregationPeriod.Months;
    
    exclType: ExclusionType = ExclusionType.None;
    exclOp1: Conditional = Conditional.LessThanOrEqual;
    excl1: number = null;
    exclOp2: Conditional = Conditional.LessThanOrEqual;
    excl2: number = null;

    rankIndustry: booleanInt = 0;
    
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
    aggrType: AggregationType = AggregationType.Average;
    aggrSpan: number = 5;
    aggrSpanOpp: number = 0;
    valType: number = 1;
    
    player: string = 'a';
    playerSort: number = 1;
    playerNum: number = 1;
    
    exclIndTypes: number = 101;
}

export enum AggregationType {
    Value = 1,
    PastValue = 2,
    Average = 3,
    RelativeToAvg = 4,
    CAGR = 5,
    Sum = 6,
    PercentChange = 7,
    GeometricAverage = 8,

    NumPositive = 9
}

export enum AggregationPeriod {
    Days = 1,
    Months = 2,
    Years = 3
}

export enum ExclusionType {
    None,
    Value,
    PercentRank
}

export enum Operator {
    Add = 1,
    Subtract = 2,
    Multiply = 3,
    Divide = 4
}

export enum Conditional {
    None = 0,
    LessThanOrEqual = 1,
    LessThan = 2,
    GreaterThanOrEqual = 3,
    GreaterThan = 4
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
