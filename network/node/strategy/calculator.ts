import {BaseNode} from '../base-node'

import {Operator, Indicator, Param, IndicatorParamType} from '../../../app/service/model/indicator.model';
import {Common} from '../../../app//utility/common';;

export class Calculator extends BaseNode {
    constructor(private indicators: Indicator[]) {
        super();
    }
    
    getIndicatorParams(): Param[] {
        var params: Param[] = [];
        
        this.indicators.forEach(indicator => {
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
}