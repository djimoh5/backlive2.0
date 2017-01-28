import { BaseModel } from './shared.model';

export interface Ticker {
    name: string;
    prices?: Price[];
}

export interface TickerCache {
    date: number;
    data: Tickerc[];
}
export interface Tickerc {
    t: string; //ticker
    i: string; //industry
    s: string; //sector
    m: number; //mtkcap
    p: number; //price
    dvp: number; //dividend paid
    dvt: string; //dividend type
    dvx: Date; //ex-dividend date
    s_d: Date; //split date
    s_f: number; //split factor
    volume: number;
}

export interface Price {
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
}

export interface LastPrice {
    ticker: string;
    price: number;
    change: number;
    percentChange: number;
}