export interface Strategy {
    _id: string;
    name: string;
    date: number;
    type: StrategyType;
}

export enum StrategyType {
    Screen,
    Backtest
}