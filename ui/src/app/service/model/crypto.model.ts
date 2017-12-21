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

export class CryptoColor {
    static BTC: string = '#ff9900';
    static ETH: string = '#b19cd9';
    static LTC: string = '#afafaf';
}