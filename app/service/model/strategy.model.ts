import {BaseModel} from './base.model';
import {Common} from 'backlive/utility';

export interface Strategy {
    _id: string;
    name: string;
    date: number;
    type: StrategyType;
    live: boolean;
    results: Performance;
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