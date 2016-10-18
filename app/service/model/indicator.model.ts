import {BaseModel} from './base.model';

export class Indicator extends BaseModel {
    _id: string = '';
    vars: (Indicator | IndicatorParam)[] = [];
    ops: Operator[] = [];
    
    allowNeg: number = 1;
    aggrType: string = 'val';
    aggrSpan: number = 5;
    aggrSpanType: number = 1;
    valType: number = 1;
    
    exclType: number = -1;
    exclOp: number = 2;
    excl: number = null;
    rankIndustry: boolean = false;
    sortDesc: number = -1;
    weight: number = 100;
    
    exp: number = 100;
    expSh: number = 100;
    exitType: number = -1;
    exitOp: number = 1;
    exit: number = null;
    threshOp: number = 1;
    thresh: number = 1;
    
    //client-side only
    readonly: boolean = true;
    compareOn: boolean = false;
    position: { x: number, y: number } = { x: 0, y: 0 };
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
    Add = 0,
    Subtract = 1,
    Multiply = 2,
    Divide = 3
}

export enum IndicatorParamType {
    Value = 0,
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
    Constant = -1
}

export declare type IndicatorParam = [IndicatorParamType, string] | [IndicatorParamType, string, number /* Function enum */];

export const DENORM_PARAM_TYPES: IndicatorParamType[] = [IndicatorParamType.IncomeStatement, IndicatorParamType.BalanceSheet, IndicatorParamType.CashFlowStatement, IndicatorParamType.Statistic];	
