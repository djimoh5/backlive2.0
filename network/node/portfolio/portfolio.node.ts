import { BaseNode, MockSession } from '../base.node'

import { ActivateNodeEvent, DataEvent, DataSubscriptionEvent, NetworkDateEvent, FeedForwardCompleteEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { PortfolioService } from '../../../core/service/portfolio.service';
import { PricingService } from '../../../core/service/pricing.service';

import { Portfolio } from '../../../core/service/model/portfolio.model';
import { IndicatorParamType } from '../../../core/service/model/indicator.model';
import { Activation } from '../../../core/service/model/node.model';

import { Stats } from '../../lib/stats';

export class PortfolioNode extends BaseNode<Portfolio> {
    pricingService: PricingService;
    prices: { [key: string]: { price: number, mtkcap: number } };
    lastPrices: { [key: string]: { price: number, mtkcap: number } };
    currentDate: number;
    actualActivation: Activation;

    constructor(private model: Portfolio) {
        super(model, PortfolioService);

        this.subscribe(NetworkDateEvent, event => this.setPrices(event.data));
    }

    setPrices(date: number) {
        console.log('portfolio computing actual output for ', date);
        this.currentDate = date;
        this.prices = this.lastPrices;

        this.pricingService.getPrices(this.currentDate).then(prices => {
            //need to adjust for splits!
            this.prices = {};
            console.log(prices);
            prices.forEach(price => {
                //need to adjust for splits!
                this.prices[price.ticker] = { price: price.price, mtkcap: price.mtkcap };
            });

            if(this.lastPrices) {                
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
            console.log('feed forward complete for ', this.currentDate);
        }
    }

    backpropagate() {
        if(this.node.activation && !this.hasOutputs()) {
            this.actualActivation = {};
            var error: number = 0;
            var count: number = 0;

            for(var key in this.node.activation) {
                if(this.prices[key] && this.lastPrices[key]) {
                    this.actualActivation[key] = this.lastPrices[key].price / this.prices[key].price;
                }
                else {
                    delete this.node.activation[key];
                }
            }

            this.actualActivation = Stats.percentRank(this.actualActivation);

            for(var key in this.node.activation) {
                error += this.node.activation[key] - this.actualActivation[key];
                count++;
            }

            error = error / count;
            console.log(`backpropagting portfolio error for ${count} tickers`);
            super.backpropagate(new BackpropagateEvent({ error: error }) )
        }
    }
}