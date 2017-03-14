import { BaseNode } from '../base.node';
import { DataEvent, DataSubscriptionEvent, ActivateNodeEvent } from '../../event/app.event';

import { IndicatorService } from '../../../core/service/indicator.service';
import { Indicator } from '../../../core/service/model/indicator.model';

import { Calculator } from './calculator';
import { Stats } from '../../lib/stats';

export class IndicatorNode extends BaseNode<Indicator> {
    calculator: Calculator;

    constructor(node: Indicator) {
        super(node, IndicatorService);
        this.calculator = new Calculator();

        this.subscribe(DataEvent, event => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams([node]) }), true);
    }
    
    receive(event: ActivateNodeEvent) {}

    processData(event: DataEvent) {
        //console.log('Indicator ' + this.nodeId + ' received data event');
        this.calculator.addValue('allCacheKeys', event.data.allCacheKeys);
        var vals: { [key: string]: number } = this.calculator.execute(this.node, event.data.cache);

        this.activate(new ActivateNodeEvent(Stats.percentRank(vals), event.date));
    }
}