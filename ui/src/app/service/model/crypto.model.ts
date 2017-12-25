export interface CryptoTicker {
    ticker: string;
    price: string;
    product_id: string;
    best_ask: string;
    best_bid: string;
    high_24h: string;
    last_size: string;
    low_24h: string;
    open_24h: string;
    sequence: number;
    side: "sell" | "buy";
    time: string; //"2017-12-17T18:54:11.023000Z"
    trade_id: number;
    type: "ticker";
    volume_24h: string; //"1047258.23913663"
    volume_30d: string; //"39347634.80864972"
}

export interface CryptoProduct {
    id: string;
    ticker: string; //defined by me
    base_currency: string;
    quote_currency: string;
    base_min_size: string;
    base_max_size: string;
    quote_increment: string;
}

export interface Crypto24HrStats {
    open: string;
    high: string;
    low: string;
    volume: string;
}

export type CryptoPrices = number[][]; //compressed json [ [ time, low, high, open, close, volume ], [ 1415398768, 0.32, 4.2, 0.35, 4.2, 12.3 ] ]

export interface CryptoOrderBook {
    sequence: number;
    asks: string[][]; //compressed json [ [ price, size, num-orders ], [ "295.96", "4.39088265", 2 ] ]
    bids: string[][];
}

export class CryptoColor {
    static BTC: string = '#ff9900';
    static BCH: string = '#ccffcc';
    static ETH: string = '#b19cd9';
    static LTC: string = '#8f8f8f';
}