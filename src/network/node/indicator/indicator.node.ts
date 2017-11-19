import { BaseNode } from '../base.node';
import { DataEvent, DataSubscriptionEvent, DataFeatureEvent, ActivateNodeEvent, BackpropagateEvent, BackpropagateCompleteEvent } from '../../event/app.event';

import { IndicatorService } from '../../../core/service/indicator.service';
import { Indicator } from '../../../core/service/model/indicator.model';

import { Activation } from '../../../core/service/model/node.model';

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
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams([node]), isFeature: true }), true);
    }
    
    receive(event: ActivateNodeEvent) {}

    processData(event: DataEvent) {
        //console.log('Indicator ' + this.nodeId + ' received data event');
        var startTime = Date.now();

        /*if(this.pastState[event.date]) {
            this.activate(new ActivateNodeEvent(this.pastState[event.date].activation, event.date));
        }
        else {*/
            this.calculator.addValue('allCacheKeys', event.data.allCacheKeys);
            var vals: { [key: string]: number } = this.calculator.execute(this.node, event.data.cache);

            /*console.log(this.node.name, this.node._id);
            if(this.node.name === 'Up Revisions Yr')
                Stats.sort(vals).forEach(key => console.log(key, vals[key]));*/

            //vals = Stats.zScore(vals); //Stats.percentRank(vals);

            this.notify(new DataFeatureEvent(vals, event.date));
            /*var actVals: number[] = [];
            var keys: string[] = [];

            for(var key in vals) {
                actVals.push(vals[key]);
                keys.push(key);
            }

            var activation = new Activation([actVals.length, 1], actVals);
            activation.keys = keys;
            this.activate(new ActivateNodeEvent(activation, event.date));*/
        //}

        Network.timings.indicatorActivation += Date.now() - startTime;
    }
}