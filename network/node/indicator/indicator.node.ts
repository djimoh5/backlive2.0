import { BaseNode } from '../base.node'
import { DataEvent, DataSubscriptionEvent, IndicatorEvent } from '../../event/app.event';

import { Indicator, IndicatorParam } from '../../../core/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../../node/data/data.node';

import { Calculator } from '../../lib/algorithm/calculator';

export class IndicatorNode extends BaseNode<Indicator> {
    calculator: Calculator;

    constructor(private model: Indicator) {
        super(model);
        this.calculator = new Calculator();

        this.subscribe(DataEvent, event => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams([model]) }));
    }
    
    receive() {}

    processData(event: DataEvent) {
        console.log('Indicator ' + this.nodeId + ' received data event');
        this.calculator.addValue('allCacheKeys', event.data.allCacheKeys);
        var vals: { [key: string]: number } = this.calculator.execute(this.model, event.data.cache);

        this.notify(new IndicatorEvent(vals));
    }
}