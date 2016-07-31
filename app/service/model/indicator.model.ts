import {BaseModel} from './base.model';

export class Indicator {
    _id: string;
    vars: Indicator[];
    ops: number[];
    fields: any[][];
    
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
