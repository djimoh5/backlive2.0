import { BaseNode, MockSession } from '../base.node'

import { ActivateNodeEvent, DataEvent, DataSubscriptionEvent, NetworkDateEvent, FeedForwardCompleteEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { PortfolioService } from '../../../core/service/portfolio.service';
import { TickerService } from '../../../core/service/ticker.service';

import { Portfolio } from '../../../core/service/model/portfolio.model';
import { IndicatorParamType } from '../../../core/service/model/indicator.model';
import { Activation } from '../../../core/service/model/node.model';

import { Stats } from '../../lib/stats';
import { Common } from '../../../app//utility/common';

export class PortfolioNode extends BaseNode<Portfolio> {
    tickerService: TickerService;
    prices: { [key: string]: { price: number, mktcap: number } };
    prevPrices: { [key: string]: { price: number, mktcap: number } };
    date: number;
    prevDate: number;
    actualActivation: Activation;

    constructor(private model: Portfolio) {
        super(model, PortfolioService);

        this.tickerService = new TickerService(new MockSession({ uid: model.uid }));
        this.subscribe(NetworkDateEvent, event => this.setPrices(event.data));
    }

    setPrices(date: number) {
        console.log('portfolio computing actual output for ', date);
        this.prevPrices = this.prices;
        this.prices = {};
        this.prevDate = this.date;
        this.date = date;

        this.tickerService.getTickers(this.date).then(tickers => {
            //need to adjust for splits!
            var dateObj: Date = Common.parseDate(this.prevDate);

            tickers.forEach(tkr => {
                if(this.prevPrices) {
                    //splits
                    if(tkr.s_d && tkr.s_f && dateObj < tkr.s_d) {
                        if(this.prevPrices[tkr.t]) {
                            this.prevPrices[tkr.t].price = this.prevPrices[tkr.t].price / tkr.s_f;
                        }
                    }

                    //dividends
                    if(tkr.dvp && dateObj < tkr.dvx && tkr.dvt == 'Cash') {
                        if(this.prevPrices[tkr.t]) {
                            this.prevPrices[tkr.t].price -= tkr.dvp;
                        }
                    }
                }
                
                this.prices[tkr.t] = { price: tkr.p, mktcap: tkr.m };
            });

            if(this.prevPrices) {                
                this.backpropagate();
            }
            else {
                this.notify(new BackpropagateCompleteEvent(null));
            }
        });
    }

    receive(event: ActivateNodeEvent) {
        console.log('portfolio received a strategy event');
        this.activate();

        if(this.node.activation && !this.hasOutputs()) {
            this.notify(new FeedForwardCompleteEvent(null));
            console.log('feed forward complete for', this.date);
        }
    }

    backpropagate() {
        if(this.node.activation && !this.hasOutputs()) {
            this.actualActivation = {};
            var error: number = 0;
            var count: number = 0;

            for(var key in this.node.activation) {
                if(this.prices[key] && this.prevPrices[key]) {
                    this.actualActivation[key] = this.prices[key].price / this.prevPrices[key].price;
                }
                else {
                    delete this.node.activation[key];
                }
            }

            this.actualActivation = Stats.percentRank(this.actualActivation, true);

            for(var key in this.node.activation) {
                error += this.node.activation[key] - this.actualActivation[key];
                //console.log('error', error)
                count++;
            }

            error = error / count;
            console.log(`backpropagating portfolio error for ${count} tickers`);
            super.backpropagate(new BackpropagateEvent({ error: error }) )
        }
    }
}