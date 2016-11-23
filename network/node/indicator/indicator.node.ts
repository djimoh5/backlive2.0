import { BaseNode } from '../base.node'
import { DataEvent, DataSubscriptionEvent, IndicatorEvent } from '../../event/app.event';

import { Indicator as IndicatorModel, IndicatorParam } from '../../../core/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../../node/data/data.node';

import { Calculator } from '../../lib/algorithm/calculator';

export class IndicatorNode extends BaseNode {
    calculator: Calculator;

    constructor(private model: IndicatorModel) {
        super();
        this.calculator = new Calculator();

        this.subscribe(DataEvent, event => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams([model]) }));
    }

    processData(event: DataEvent) {
        console.log('Indicator ' + this.nodeId + ' received data event');
        this.calculator.addValue('allCacheKeys', event.data.allCacheKeys);
        var vals: { [key: string]: number } = this.calculator.execute(this.model, event.data.cache);

        this.notify(new IndicatorEvent(vals));
    }

    setModel(model: IndicatorModel) {
        this.model = model;
    }

    getModel() {
        return this.model;
    }
}