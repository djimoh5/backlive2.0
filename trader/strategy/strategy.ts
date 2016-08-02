import {EventQueue} from '../lib/events/event-queue';
import {Strategy as StrategyModel, Operator, Indicator} from 'backlive/service/model';
import {Common} from 'backlive/utility';

export class Strategy extends EventQueue {
    constructor(private model: StrategyModel) {
        super();
    }
    
    getIndicatorParams() {
        var params = [];
        if(this.model.indicators.short) {
           this.model.indicators.short.forEach(indicator => {
                this.getIndicatorParamsHelper(indicator, params);
            });
        }
    }

    private getIndicatorParamsHelper(indicator: Indicator, params: [number, string][]) {
        for(var i = 0, cnt = indicator.vars.length; i < cnt; i++) {
			var obj = indicator.vars[i];
			
			if(obj) {
				if(Common.isObject(obj)) {
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

