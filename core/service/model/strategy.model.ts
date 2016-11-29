import { Node, NodeType } from './node.model';
import { Indicator } from './indicator.model';
import { Common } from 'backlive/utility';

export class Strategy extends Node {
    date: number;
    type: StrategyType;
    live: number;  
    
    data: StrategyParams;

    constructor(name: string) {
        super(NodeType.Strategy);
        this.name = name;
    }
    
    //client-side
    results: Performance;
}

export interface StrategyParams {
    indicators: any;//{ long: Indicator[], short: Indicator[] };
    exposure: any;//{ long: Indicator[], short: Indicator[] };
    exclusions: Indicator[];
    
    universeType: string;
    universeTkrs: { incl:number, tkrs: string[] };
    
    //portfolio settings
    startYr: number,
    endYr: number,
    minMktCap: number,
    
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