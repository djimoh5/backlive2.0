import { BaseNode, MockSession } from '../base.node';

import { 
    ActivateNodeEvent, BackpropagateCompleteEvent, BackpropagateEvent, 
    EpochCompleteEvent, DataEvent, DataSubscriptionEvent
} from '../../event/app.event';

import { PortfolioService } from '../../../core/service/portfolio.service';
import { TickerService } from '../../../core/service/ticker.service';

import { DataResult } from '../data/data.node';

import { Portfolio } from '../../../core/service/model/portfolio.model';
import { Activation } from '../../../core/service/model/node.model';
import { IndicatorParamType } from '../../../core/service/model/indicator.model';

import { Stats } from '../../lib/stats';
import { Common } from '../../../app//utility/common';

import { Network } from '../../network';

export class PortfolioNode extends BaseNode<Portfolio> {
    tickerService: TickerService;
    prices: { [key: string]: { price: number, mktcap: number, dividend: number } };
    pricesCache: { [key: number]: { [key: string]: { price: number, mktcap: number, dividend: number } } } = {};
    prevPrices: { [key: string]: { price: number, mktcap: number } };
    date: number;
    prevDate: number;

    totalCost: number = 0;
    trainingCount: number = 0;

    capital = 50000;
    positions: Position[] = [];

    constructor(node: Portfolio) {
        super(node, PortfolioService);

        this.tickerService = new TickerService(new MockSession({ uid: node.uid }));

        this.subscribe(DataEvent, event => this.processPrices(event));
        this.subscribe(EpochCompleteEvent, event => {
            if(this.trainingCount === 0) {
                console.log('Error: training count for epoch was 0');
                throw('training count for epoch was 0');
            }
            console.log('total cost:', this.totalCost, 'avg. cost:', this.totalCost / this.trainingCount, 'training size:', this.trainingCount);
            this.totalCost = 0;
            this.trainingCount = 0;
        });

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
        var tkrs: string[] = Stats.sort(this.pastState[this.date].activation, true);
        var tkrLen = tkrs.length;
        var numPos = Math.min(20, tkrLen);
        
        var posSize = this.capital / numPos;

        //long
        for(var i = 0; i < numPos; i++) {
            var tkr = tkrs[i];
            var price = this.prices[tkr].price;
            var shares = Math.floor(posSize / price);
            this.positions.push({ ticker: tkr, price: price, shares: shares });

            //console.log('Buy', tkr, price, shares);
            this.capital -= price * shares;
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

            if(this.state.activation) {
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
        var state = this.pastState[this.prevDate];

        if(state.activation && this.numOutputs() === 0) {
            var actualActivation: Activation = {};
            var error: Activation = {};
            var actCnt = 0;

            for(var key in state.activation) {
                if(this.prices[key] && this.prevPrices[key]) {
                    actualActivation[key] = (this.prices[key].price + this.prices[key].dividend) / this.prevPrices[key].price;
                    actCnt++;
                }
                else {
                    delete state.activation[key];
                }
            }

            //actualActivation = Stats.percentRank(actualActivation, true);
            for(var k in actualActivation) {
                actualActivation[k] = this.sigmoid(actualActivation[k]);
            }
            var predictedActivation = state.activation;//Stats.percentRank(state.activation, true);

            for(var key in state.activation) {
                error[key] = Network.costFunction.delta(predictedActivation[key], actualActivation[key]);
                this.totalCost += Network.costFunction.cost(predictedActivation[key], actualActivation[key]);
                this.trainingCount++;
            }

            if(Network.isLearning) {
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