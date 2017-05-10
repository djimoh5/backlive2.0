import { BaseNode, MockSession } from '../base.node';

import { 
    ActivateNodeEvent, BackpropagateCompleteEvent, BackpropagateEvent, 
    EpochCompleteEvent, DataEvent, DataSubscriptionEvent
} from '../../event/app.event';

import { PortfolioService } from '../../../core/service/portfolio.service';
import { PricingService } from '../../../core/service/pricing.service';

import { DataResult } from '../data/data.node';

import { Portfolio } from '../../../core/service/model/portfolio.model';
import { Activation } from '../../../core/service/model/node.model';
import { IndicatorParamType } from '../../../core/service/model/indicator.model';

import { Stats } from '../../lib/stats';
import { Common } from '../../../app//utility/common';

import { Network } from '../../network';

export class PortfolioNode extends BaseNode<Portfolio> {
    pricingService: PricingService;
    prices: { [key: string]: { price: number, mktcap: number, dividend: number } };
    pricesCache: { [key: number]: { [key: string]: { price: number, mktcap: number, dividend: number } } } = {};
    prevPrices: { [key: string]: { price: number, mktcap: number } };
    date: number;
    prevDate: number;

    capital = 50000;
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

        this.prevPrices = this.prices;
        this.prices = {};
        this.prevDate = this.date;
        this.date = date;

        if(this.pricesCache[date]) {
            this.prices = this.pricesCache[date];
        }
        else {
            var prevDateObj: Date = Common.parseDate(this.prevDate);
            for(var key in data) {
                var tkr: Ticker = <Ticker>data[key];
                if(tkr.price) {
                    this.prices[tkr.ticker] = { price: tkr.price, mktcap: tkr.mktcap, dividend: 0 };

                    if(this.prevPrices) {
                        //splits
                        if(tkr.split_date && tkr.split_fact && prevDateObj < tkr.split_date) {
                            if(this.prevPrices[tkr.ticker]) {
                                this.prevPrices[tkr.ticker].price = this.prevPrices[tkr.ticker].price / tkr.split_fact;
                            }
                        }

                        //dividends
                        if(tkr.dvp && this.prevDate < tkr.dvx && tkr.dvt == 'Cash') {
                            this.prices[tkr.ticker].dividend = tkr.dvp;
                        }
                    }
                }
            };

            this.pricesCache[date] = this.prices;
        }

        Network.timings.activation += Date.now() - startTime;
    }

    trade() {
        if(!Network.isLearning) {
            this.closePositions();
            this.openPositions();
        }
    }

    closePositions() {
        this.positions.forEach(position => {
            var price = this.prevPrices[position.ticker].price;
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
        activation.vals.forEach((input, index) => {
            keyVals[activation.keys[index]] = input[0];
        });

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
                if(this.prevDate) {
                    this.backpropagate();
                }
                else {
                    this.notify(new BackpropagateCompleteEvent(null));
                }

                this.trade();
            }
        }
        else {
            this.activate();
        }
    }

    backpropagate() {
        var startTime = Date.now();
        
        var state = this.pastState[this.prevDate];

        if(state.activation && this.numOutputs() === 0) {
            var actualActivation = new Activation();
            var error: Activation = new Activation();

            var marketReturn = (this.marketPrices[this.date] - this.marketPrices[this.prevDate]) / this.marketPrices[this.prevDate];

            var key: string;
            for(var i = 0; key = state.activation.keys[i]; i++) {
                if(this.prices[key] && this.prevPrices[key]) {
                    var alpha = ((this.prices[key].price + this.prices[key].dividend) / this.prevPrices[key].price) - marketReturn;
                    actualActivation.vals.push([this.sigmoid(alpha)]);
                }
                else {
                    state.activation.vals.splice(i, 1);
                    state.activation.keys.splice(i, 1);
                    i--;
                }
            }

            var predictedActivation = state.activation.vals;
            predictedActivation.forEach((input, index) => {
                error.vals.push([Network.costFunction.delta(input[0], actualActivation.vals[index][0])]);
                this.totalCost += Network.costFunction.cost(input[0], actualActivation.vals[index][0]);
                this.trainingCount++;
            });

            if(Network.isLearning) {
                Network.timings.backpropagation += Date.now() - startTime;
                super.backpropagate(new BackpropagateEvent({ error: error }, this.prevDate));
            }
            else {
                //console.log('prediction:', predictedActivation);
                //console.log('actual:', actualActivation);
                
                this.notify(new BackpropagateCompleteEvent(null, this.prevDate));
            }
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