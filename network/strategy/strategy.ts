import {BaseNode} from '../base-node'
import {EventQueue} from '../lib/events/event-queue';
import {DataEvent, DataSubscriptionEvent} from '../lib/events/app-event';
import {IDataHandler} from '../data-handler/data-handler';

import {Strategy as StrategyModel} from '../../app/service/model/strategy.model';
import {Operator, Indicator, Param} from '../../app/service/model/indicator.model';
import {Common} from '../../app//utility/common';;

export class Strategy extends BaseNode {
    allIndicators: Indicator[];
    
    constructor(private model: StrategyModel) {
        super();
        var data = model.data;
        this.allIndicators = data.indicators.long.concat(data.indicators.short, data.exposure.long, data.exclusions);
        
        this.subscribe(DataEvent, (event: DataEvent) => this.processData(event));
        this.notify(new DataSubscriptionEvent({ params: this.getIndicatorParams(), startDate: data.startYr, endDate: data.endYr, 
            entities: (data.universeTkrs.incl === 1 && data.universeTkrs.tkrs && data.universeTkrs.tkrs.length > 0) ? data.universeTkrs.tkrs : null }));
    }
    
    processData(event: DataEvent) {
        console.log('Strategy received event');
    }
    
    getIndicatorParams(): Param[] {
        var params: [number, string][] = [];
        
        this.allIndicators.forEach(indicator => {
            this.getIndicatorParamsHelper(indicator, params);
        });
        
        return params;
    }

    private getIndicatorParamsHelper(indicator: Indicator, params: Param[]) {
        for(var i = 0, cnt = indicator.vars.length; i < cnt; i++) {
			var obj = indicator.vars[i];
			
			if(obj) {
				if(!Common.isArray(obj)) {
                    this.getIndicatorParamsHelper(<Indicator> obj, params);
                }
                else {
					var type: number = parseInt(obj[0]);
					var field: string = obj[1];
					params.push([type, field]);					
				}
			}
		}
    }
    
    getModel() {
        return this.model;
    }
    
}