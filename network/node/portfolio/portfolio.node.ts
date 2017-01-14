import { BaseNode, MockSession } from '../base.node'

import { ActivateNodeEvent, DataEvent, DataSubscriptionEvent, NetworkDateEvent, FeedForwardCompleteEvent, BackpropagateEvent, BackpropagateCompleteEvent, EpochCompleteEvent } from '../../event/app.event';

import { PortfolioService } from '../../../core/service/portfolio.service';
import { TickerService } from '../../../core/service/ticker.service';

import { Portfolio } from '../../../core/service/model/portfolio.model';
import { IndicatorParamType } from '../../../core/service/model/indicator.model';
import { Activation } from '../../../core/service/model/node.model';

import { Stats } from '../../lib/stats';
import { Common } from '../../../app//utility/common';

export class PortfolioNode extends BaseNode<Portfolio> {
    tickerService: TickerService;
    prices: { [key: string]: { price: number, mktcap: number, dividend: number } };
    pricesCache: { [key: number]: { [key: string]: { price: number, mktcap: number, dividend: number } } } = {};
    prevPrices: { [key: string]: { price: number, mktcap: number } };
    date: number;
    prevDate: number;
    actualActivation: Activation;

    totalCost: number = 0;
    trainingCount: number = 0;

    constructor(node: Portfolio) {
        super(node, PortfolioService);

        this.tickerService = new TickerService(new MockSession({ uid: node.uid }));
        this.subscribe(NetworkDateEvent, event => this.setPrices(event.data));
        this.subscribe(EpochCompleteEvent, event => {
            console.log('total cost:', this.totalCost, 'training size:', this.trainingCount);
            this.totalCost = 0;
            this.trainingCount = 0;
        });
    }

    setPrices(date: number) {
        //console.log('portfolio computing actual output for ', date);
        this.prevPrices = this.prices;
        this.prices = {};
        this.prevDate = this.date;
        this.date = date;

        if(this.pricesCache[date]) {
            this.prices = this.pricesCache[date];
            this.finishSetPrices(date);
        }
        else {
            this.tickerService.getTickers(this.date).then(tickers => {
                //need to adjust for splits!
                var dateObj: Date = Common.parseDate(this.prevDate);

                tickers.forEach(tkr => {
                    this.prices[tkr.t] = { price: tkr.p, mktcap: tkr.m, dividend: 0 };

                    if(this.prevPrices) {
                        //splits
                        if(tkr.s_d && tkr.s_f && dateObj < tkr.s_d) {
                            if(this.prevPrices[tkr.t]) {
                                this.prevPrices[tkr.t].price = this.prevPrices[tkr.t].price / tkr.s_f;
                            }
                        }

                        //dividends
                        if(tkr.dvp && dateObj < tkr.dvx && tkr.dvt == 'Cash') {
                            this.prices[tkr.t].dividend = tkr.dvp;
                        }
                    }
                });

                this.finishSetPrices(date);
            });
        }
    }

    private finishSetPrices(date: number) {
        this.pricesCache[date] = this.prices;

        if(this.prevPrices && this.prevDate < date) {                
            this.backpropagate();
        }
        else {
            this.notify(new BackpropagateCompleteEvent(null));
        }
    }

    receive(event: ActivateNodeEvent) {
        //console.log('portfolio received a strategy event');
        if(this.numOutputs() === 0) {
            if(this.node.inputs.length === 1) { //just one strategy passing through its values, so use those
                this.state.activation = event.data;
            }
            else { //multiple strategy inputs
                this.activate(null, true);
            }

            if(this.state.activation) {
                this.notify(new FeedForwardCompleteEvent(null));
                //console.log('feed forward complete for', this.date);
            }
        }
        else {
            this.activate();
        }
    }

    backpropagate() {
        if(this.state.activation && this.numOutputs() === 0) {
            this.actualActivation = {};
            var error: Activation = {};

            for(var key in this.state.activation) {
                if(this.prices[key] && this.prevPrices[key]) {
                    this.actualActivation[key] = (this.prices[key].price + this.prices[key].dividend) / this.prevPrices[key].price;
                }
                else {
                    delete this.state.activation[key];
                }
            }

            this.actualActivation = Stats.percentRank(this.actualActivation, true);
            for(var k in this.actualActivation) {
                this.actualActivation[k] = this.sigmoid(this.actualActivation[k]);
            }

            for(var key in this.state.activation) {
                //console.log(this.cost(this.node.activation[key], this.actualActivation[key]));
                error[key] = this.costDelta(this.state.activation[key], this.actualActivation[key]);
                this.totalCost += this.cost(this.state.activation[key], this.actualActivation[key]);
                this.trainingCount++;
                //console.log('error', error)
            }

            //console.log('total error', error)
            //console.log('expected', this.node.activation)
            //console.log('actual', this.actualActivation)

            //console.log(`backpropagating portfolio error`);
            
            super.backpropagate(new BackpropagateEvent({ error: error }) )
        }
    }

    //PULL THIS OUT INTO SEPARATE CLASS
    cost(output: number, target: number) {
        return .5 * Math.pow(output - target, 2);
    }

    costDerivative(output: number, target: number) {
        return output - target;
    }

    costDelta(output: number, target: number) {
        //in our case output is sigmoid so can use it directly to calculate sig prime: sig * (1 - sig)
        return this.costDerivative(output, target) * (output * (1 - output));
    }
}