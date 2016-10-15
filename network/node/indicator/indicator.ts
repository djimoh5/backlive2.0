import {BaseNode} from '../base-node'
import {DataEvent, DataSubscriptionEvent, IndicatorUpdateEvent} from '../../lib/events/app-event';

import {Indicator as IndicatorModel, IndicatorParam} from '../../../app/service/model/indicator.model';
import {Common} from '../../../app//utility/common';

import {DataCache} from '../../node/data-handler/data-handler';

import {Calculator} from '../../lib/algorithm/calculator';

export class Indicator extends BaseNode {
    calculator: Calculator;
    
    constructor(private model: IndicatorModel) {
        super();
        this.calculator = new Calculator();
        
        this.subscribe(DataEvent, (event: DataEvent) => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams([model]) }));
    }
    
    processData(event: DataEvent) {
        console.log('Indicator ' + this.objectId + ' received data event');
        this.calculator.addValue('allCacheKeys', event.data.allCacheKeys);
        var vals: { [key: string]: number } = this.calculator.execute(this.model, event.data.cache);
        
        this.notify(new IndicatorUpdateEvent(vals));
    }
    
    getModel() {
        return this.model;
    }
}