import { BaseModel } from './shared.model';

export interface Ticker {
    name: string;
    prices?: Price[];
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
    ticker: string,
    price: number;
    change: number;
    percentChange: number;
}