import { Node, NodeType } from './node.model';
import { Indicator } from './indicator.model';
import { Common } from 'backlive/utility';

export class Strategy extends Node {
    date: number;
    type: StrategyType;
    live: number; 

    startDate: number;
    endDate: number;
    filter: StrategyFilter;
    settings: StrategySettings;

    data: StrategyParams; //deprecateed, remove this!!

    constructor(name: string) {
        super(NodeType.Strategy);
        this.name = name;
    }
    
    //client-side
    results: Performance;
}

export class StrategyFilter {
    minMktCap: number = 200;
    maxMktCap: number;
    exclSectors: string[];
    tickers: { incl: booleanInt, tkrs: string[] };
    exchange: ''|'N'|'M'|'A' = '';
    index: ''|'sp'|'dow' = '';
    adr: booleanInt = 0;
}

export class StrategySettings {
    initCapt: number = 10000;
    numStocks: number = 20;
    weighting: PortfolioWeighting = PortfolioWeighting.Equal;
    frequency: TradingFrequency = TradingFrequency.Quarterly;
    sectNeutral: booleanInt = 0;
    exposure: number = 100;
    shortExposure: number = 0;
    stopLoss: number;
    posStopLoss: number;
    friction: number = 0;
    frictionType: FrictionType = FrictionType.Percentage;
    benchmark: string = 'SPY';
}

export interface StrategyParams {
    indicators: any;//{ long: Indicator[], short: Indicator[] };
    exposure: any;//{ long: Indicator[], short: Indicator[] };
    exclusions: Indicator[];
    
    universeType: string;
    universeTkrs: { incl:number, tkrs: string[] };
    
    //portfolio settings
    startYr: number;
    endYr: number;
    minMktCap: number;
    
    initCapt: number;
    numStocks: number;
    weight: number;
    rebalance: number;
    sectNeutral: number;
    leverage: number;
    shortLeverage: number;
    stopLoss: number;
    posStopLoss: number;
    friction: number;
    frictionType: string;
    benchmark: string;
    exclSectors: string[];
    adr: string;
    date: number; //for screens only
}

export class Performance {
    startDate: number;
    endDate: number;
    return: number;
    cagr: number;
    
    constructor(startAmt, endAmt, startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        var dateDiff = Common.dateDiff(Common.parseDate(this.startDate), Common.parseDate(this.endDate), 365);
        
        if(startAmt ===  endAmt) {
            this.return = this.cagr = 0;
        }
        else {
            this.return = endAmt / startAmt;
            this.cagr = parseFloat(((Math.pow(this.return, 1 / dateDiff) - 1) * 100).toFixed(2));
            this.return = parseFloat(((this.return - 1) * 100).toFixed(2));
        }
    }
}

export enum StrategyType {
    Screen,
    Backtest
}

export enum PortfolioWeighting {
    Equal = 1,
    Score = 2,
    LargeCap = 3,
    SmallCap = 4,
    Volatility = 5,
    MinCorrelation = 6
}

export enum TradingFrequency {
    Daily = -99,
    Weekly = -1,
    BiWeekly = -2,
    Monthly = 1,
    BiMonthly = 2,
    Quarterly = 3,
    Annually = 12
}

export enum FrictionType {
    Percentage = 1,
    InteractiveBrokers = 2
}

export type booleanInt = 1|0;