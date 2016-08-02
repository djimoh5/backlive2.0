import {EventQueue} from '../lib/events/event-queue';
import {DataEvent} from '../lib/events/trader-event';
import {DataHandler} from './data-handler';

import {RFIELD_MAP} from './field-map';
import {IndicatorParamType} from 'backlive/service/model';

import {Common} from 'backlive/utility';

export class DataLoaderDataHandler extends DataHandler {
    fields: { [key: number]: {[name: string]: boolean} }[];
    useDenormTable: boolean = true;
    denormParamTypes: IndicatorParamType[] = [IndicatorParamType.IncomeStatement, IndicatorParamType.BalanceSheet, IndicatorParamType.CashFlowStatement, IndicatorParamType.Statistic];	
    tables = [ "", "is", "bs", "cf", "snt", "mos", "tech", "macro", "shrt_intr", "is_gr", "fs", "fi" ]; 
    
    constructor() {
        super();
    }
    
    registerParams(obj: any, params: [number, string][], callback: Function) {
        this.subscribe(obj, new DataEvent(), callback);
        
        this.setFields(params);
    }
    
    setFields(params: [number, string][]) {
    	for(var i = 0, cnt = params.length; i < cnt; i++) {
			var type = params[i][0];
            var field = params[i][1];
            
            if(type != IndicatorParamType.Constant) { // && (type != ParamType.Statistic || field != "price")) {
                var map: string = RFIELD_MAP[type] ? RFIELD_MAP[type][field] : null;

                if(this.useDenormTable && Common.inArray(type, this.denormParamTypes)) {
                    map = this.tables[type] + '_' + (map ? map : field);
                    type = IndicatorParamType.FinancialStatement;
                }
                
                if(!this.fields[type]) {
                    this.fields[type] = {};
                }
                
                if(map) {
                    this.fields[type][map] = 1;
                }
                else {
                    this.fields[type][field] = 1;
                }
            }
		}
	}
}