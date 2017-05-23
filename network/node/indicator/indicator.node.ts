import { BaseNode } from '../base.node';
import { DataEvent, DataSubscriptionEvent, ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { IndicatorService } from '../../../core/service/indicator.service';
import { Indicator } from '../../../core/service/model/indicator.model';

import { Calculator } from './calculator';
import { Stats } from '../../lib/stats';

import { Network } from '../../network';

export class IndicatorNode extends BaseNode<Indicator> {
    calculator: Calculator;

    constructor(node: Indicator) {
        super(node, IndicatorService);
        this.calculator = new Calculator();
        this.preserveState = true;
        
        this.subscribe(DataEvent, event => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams([node]) }), true);
    }
    
    receive(event: ActivateNodeEvent) {}

    processData(event: DataEvent) {
        //console.log('Indicator ' + this.nodeId + ' received data event');
        var startTime = Date.now();

        if(this.pastState[event.date]) {
            this.activate(new ActivateNodeEvent(this.pastState[event.date].activation, event.date));
        }
        else {
            this.calculator.addValue('allCacheKeys', event.data.allCacheKeys);
            var vals: { [key: string]: number } = this.calculator.execute(this.node, event.data.cache);
            vals = Stats.percentRank(vals);

            var actVals: number[][] = [];
            var keys: string[] = [];

            for(var key in vals) {
                actVals.push([vals[key]]);
                keys.push(key);
            }

            this.activate(new ActivateNodeEvent({ input: actVals, keys: keys, output: null }, event.date));
        }

        Network.timings.indicatorActivation += Date.now() - startTime;
    }

    protected backpropagate(event: BackpropagateEvent) {
        var startTime = Date.now();
        
        var state = this.pastState[event.date];

        if(event.data.weights) {
            state.activationErrors[event.senderId] = event.data;

            for(var i = 0, len = this.outputs.length; i < len; i++) {
                if(!state.activationErrors[this.outputs[i]]) {
                    Network.timings.backpropagation += Date.now() - startTime;
                    return; //must have backpropagation error from all your outputs to backpropagate yourself
                }
            }
            
            Network.timings.backpropagation += Date.now() - startTime;
            this.notify(new BackpropagateCompleteEvent(null, event.date));
            return;
        }
    }
}