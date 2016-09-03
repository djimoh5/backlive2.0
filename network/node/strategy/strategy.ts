import {BaseNode} from '../base-node'
import {DataEvent, DataSubscriptionEvent} from '../../lib/events/app-event';

import {Strategy as StrategyModel} from '../../../app/service/model/strategy.model';
import {Operator, Indicator, Param} from '../../../app/service/model/indicator.model';
import {Common} from '../../../app//utility/common';

import {Calculator} from './calculator';

export class Strategy extends BaseNode {
    allIndicators: Indicator[];
    calculator: Calculator;
    
    constructor(private model: StrategyModel) {
        super();
        var data = model.data;
        this.allIndicators = data.indicators.long.concat(data.indicators.short, data.exposure.long, data.exclusions);
        
        this.calculator = new Calculator(this.allIndicators);
        
        this.subscribe(DataEvent, (event: DataEvent) => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.calculator.getIndicatorParams(), startDate: data.startYr, endDate: data.endYr, 
            entities: (data.universeTkrs.incl === 1 && data.universeTkrs.tkrs && data.universeTkrs.tkrs.length > 0) ? data.universeTkrs.tkrs : null }));
    }
    
    processData(event: DataEvent) {
        console.log('Strategy received event');
    }
    
    getModel() {
        return this.model;
    }
    
}