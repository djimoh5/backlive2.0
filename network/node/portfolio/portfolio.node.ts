import { BaseNode, MockSession } from '../base.node';

import { ActivateNodeEvent, DataEvent, DataFeatureLabelEvent, DataSubscriptionEvent } from '../../event/app.event';

import { PortfolioService } from '../../../core/service/portfolio.service';
import { PricingService } from '../../../core/service/pricing.service';

import { DataResult } from '../data/data.node';

import { Portfolio } from '../../../core/service/model/portfolio.model';
import { IndicatorParamType } from '../../../core/service/model/indicator.model';

import { Stats } from '../../lib/stats';
import { Common } from '../../../app//utility/common';

import { Network } from '../../network';

export class PortfolioNode extends BaseNode<Portfolio> {
    pricingService: PricingService;
    prices: Prices;
    pricesCache: { [key: number]: Prices } = {};

    date: number;
    dates: number[] = [];

    capital: number = 50000;
    tradingFreq: number = 1; //# of periods
    positions: Position[] = [];

    marketPrices: { [key: number]: number } = {};

    constructor(node: Portfolio) {
        super(node, PortfolioService);

        this.pricingService = new PricingService(new MockSession({ uid: node.uid }));
        this.pricingService.getByTicker('SPY').then(prices => {
            prices.forEach(price => {
                this.marketPrices[price.date] = price.price;
            });
        });

        this.subscribe(DataEvent, event => this.processPrices(event));

        this.notify(new DataSubscriptionEvent({ params: [
            [IndicatorParamType.Ticker, 'price'],
            [IndicatorParamType.Ticker, 'mktcap'],
            [IndicatorParamType.Ticker, 'dvp'],
            [IndicatorParamType.Ticker, 'dvx'],
            [IndicatorParamType.Ticker, 'dvt'],
            [IndicatorParamType.Ticker, 'split_date'],
            [IndicatorParamType.Ticker, 'split_fact'],
            [IndicatorParamType.Ticker, 'adr']
        ]}), true);
    }

    processPrices(event: DataEvent) {
        if(event.data.cache[IndicatorParamType.Ticker]) {
            this.setPrices(event.date, event.data.cache[IndicatorParamType.Ticker]);
        }
        else {
            throw('no prices for date ' + event.date);
        }
    }

    setPrices(date: number, data: DataResult) {
        //console.log('portfolio computing actual output for ', date);
        var startTime = Date.now();

        this.date = date;
        this.dates.push(date);
        var prevDate = this.dates[this.dates.length - this.tradingFreq - 1];
        
        this.prices = {};
        var prevPrices: Prices;

        var marketReturn: number = null;
        var labels: { [key: string]: number[] } = {};

        if(prevDate) {
            marketReturn = (this.marketPrices[this.date] - this.marketPrices[prevDate]) / this.marketPrices[prevDate];
            prevPrices = this.pricesCache[prevDate];
            //console.log('return: ', marketReturn, prevDate, ' - ', this.date);
        }

        if(this.pricesCache[date]) {
            this.prices = this.pricesCache[date];
        }
        else {
            var prevDateObj: Date = Common.parseDate(prevDate);
            var rets: { tkr: string, ret: number }[] = [];

            for(var key in data) {
                var tkr: Ticker = <Ticker>data[key];
                if(tkr.price) {
                    this.prices[tkr.ticker] = { price: tkr.price, mktcap: tkr.mktcap, dividend: 0 };

                    if(prevPrices) {
                        //splits
                        if(tkr.split_date && tkr.split_fact && prevDateObj < tkr.split_date) {
                            if(prevPrices[tkr.ticker]) {
                                prevPrices[tkr.ticker].price = prevPrices[tkr.ticker].price / tkr.split_fact;
                            }
                        }

                        //dividends
                        if(tkr.dvp && prevDate < tkr.dvx && tkr.dvt == 'Cash') {
                            this.prices[tkr.ticker].dividend = tkr.dvp;
                        }

                        if(prevPrices[tkr.ticker]) {
                            var ret = (((this.prices[tkr.ticker].price + this.prices[tkr.ticker].dividend) - prevPrices[tkr.ticker].price) / prevPrices[tkr.ticker].price);// - marketReturn;
                            rets.push({ tkr: tkr.ticker, ret: ret });
                            
                            /*if(alpha > .02) {
                                labels[tkr.ticker] = [1, 0, 0];
                            }
                            else if(alpha < -.02) {
                                labels[tkr.ticker] = [0, 0, 1];
                            }
                            else {
                                labels[tkr.ticker] = [0, 1, 0];
                            }*/
                            //labels[tkr.ticker] = [ret]; //linear activation
                            labels[tkr.ticker] = [1 / (1 + Math.exp(-ret))]; //sigmoid activation
                            //console.log(tkr.ticker, labels[tkr.ticker]);
                        }
                    }
                }
            };

            /*var len = rets.length;
            var numCls = 5;
            var tile = Math.ceil(len / numCls);
            Common.sort(rets, 'ret')

            for(var i = 0; i < len; i++) {
                var t = rets[i];
                var index = Math.floor(i / tile);
                if(index >= numCls) {
                    throw `out of range for number of classes ${i} - ${numCls}`;
                }

                labels[t.tkr] = [0, 0, 0, 0, 0];
                labels[t.tkr][index] = 1;
                //console.log(t.tkr, t.ret, labels[t.tkr]);
            }*/

            this.pricesCache[date] = this.prices;
        }

        Network.timings.activation += Date.now() - startTime;

        if(prevDate) {
            this.notify(new DataFeatureLabelEvent(labels, prevDate));
        }
        else {
            this.notify(new DataFeatureLabelEvent(null, this.date));
        }
    }

    trade() {
        if(!Network.isLearning) {
            this.closePositions();
            //this.openPositions();
        }
    }

    closePositions() {
        this.positions.forEach(position => {
            var prevDate = this.dates[this.dates.length - this.tradingFreq - 1];
            var price = this.pricesCache[prevDate][position.ticker].price;
            var ret = 0;

            if(this.prices[position.ticker]) {
                var prevPrice = price;
                price = this.prices[position.ticker].price + this.prices[position.ticker].dividend;
                ret = (price - prevPrice) / prevPrice * (position.shares < 0 ? -1 : 1);
            }

            //console.log('closing:', position.ticker, 'return:',  ret);
            this.capital += price * position.shares;
        });

        console.log('capital:', this.capital);
        this.positions = [];
    }

    openPositions() {
        var keyVals: { [key: string]: number } = {};
        var activation = this.pastState[this.date].activation;
        /*activation.input.forEach((input, index) => {
            keyVals[activation.keys[index]] = input[0];
        });*/

        var tkrs: string[] = Stats.sort(keyVals, true);
        var tkrLen = tkrs.length;
        var numPos = Math.min(20, tkrLen);
        
        var posSize = this.capital / numPos;
        var index = 0;

        //long
        while(numPos > 0 && index < tkrLen) {
            var tkr = tkrs[index++];
            var price = this.prices[tkr];

            if(price) {
                var shares = Math.floor(posSize / price.price);
                this.positions.push({ ticker: tkr, price: price.price, shares: shares });

                //console.log('Buy', tkr, price, shares);
                this.capital -= price.price * shares;
                numPos--;
            }
        }

        //short
        /*for(var i = tkrLen - 1; i >= tkrLen - numPos; i--) {
            var tkr = tkrs[i];
            var price = this.prices[tkr].price;
            var shares = -1 * Math.floor(posSize / price);
            this.positions.push({ ticker: tkr, price: price, shares: shares });

            //console.log('Sell', tkr, price, shares);
            this.capital -= price * shares;
        }*/
    }

    receive(event: ActivateNodeEvent) {
        if(this.numOutputs() === 0) {
            if(this.node.inputs.length === 1) { //just one strategy passing through its values, so use those
                this.persistActivation(event);
                this.notify(new ActivateNodeEvent(this.state.activation, event.date));
            }
            else { //multiple strategy inputs
                this.activate(null, false);
            }

            var state = this.pastState[event.date];
            if(state.activation) {
                this.trade();
            }
        }
        else {
            this.activate();
        }
    }
}

class Ticker {
    ticker: string;
    date: number;
    price?: number;
    mktcap?: number;
    dvp?: number; //dividend paid
    dvx?: number; //ex-dividend date
    dvt?: string; //dividend type e.g. Cash
    split_date?: Date;
    split_fact?: number;
}

class Position {
    ticker: string;
    price: number;
    shares: number;
}

interface Prices {
    [key: string]: { price: number, mktcap: number, dividend: number }
}