export interface Ticker {
    name: string;
    prices: Price;
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