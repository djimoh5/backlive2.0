import { Component, Input, Output, OnChanges, EventEmitter, SimpleChanges } from '@angular/core';


import { BaseComponent } from 'backlive/component/shared';

import { AppService, LookupService } from 'backlive/service';
import { DataField, DataFieldMap, IndicatorParamType, IndicatorParam } from 'backlive/service/model';

import { SearchKeyCode } from '../editor/editor.component';

@Component({
    selector: 'backlive-indicator-data-menu',
    templateUrl: 'data-menu.component.html',
    styleUrls: ['data-menu.component.less'],
})
export class IndicatorDataMenuComponent extends BaseComponent implements OnChanges {
    @Input() searchKey: string;
    @Input() searchKeyCode: SearchKeyCode;
    @Input() excludedTypes: number;

    @Output() select: EventEmitter<IndicatorParam> = new EventEmitter<IndicatorParam>();

    dataFields: DataField[] = dataFields;
    selectedDataField: DataField;
      
    constructor(appService: AppService, private lookupService: LookupService) {
        super(appService);
        this.lookupService.getDataFields().then(dataFields => {
            this.dataFields = dataFields;
            this.dataFields.forEach(dataField => {
                dataField.fields.sort((a: string, b: string) => { 
                    return DataFieldMap.toDisplayName(dataField.type, a).toLowerCase()
                            .localeCompare(DataFieldMap.toDisplayName(dataField.type, b).toLowerCase()); 
                });

                dataField.fieldObjs = [];
                dataField.fields.forEach(field => {
                    dataField.fieldObjs.push({ name: field });
                });
            });

            this.selectedDataField = this.dataFields[0];
            this.activateField();
        });
    }
    
    ngOnChanges(simpleChanges: SimpleChanges) {
        if(simpleChanges['searchKey']) {
            this.searchFields();
        }
        else if(simpleChanges['searchKeyCode']) {
            this.processKeyCode();
        }
    }

    searchFields() {
        if(this.searchKey) {
            var key = this.searchKey.toLowerCase();
            var firstVisibleDataField: DataField;

            this.dataFields.forEach(dataField => {
                dataField.fieldCount = dataField.fields.length;
                dataField.fieldObjs.forEach(field => {
                    field.active = false;

                    if(DataFieldMap.toDisplayName(dataField.type, field.name).toLowerCase().indexOf(key) < 0) {
                        field.hidden = true;
                        dataField.fieldCount--;
                    }
                    else {
                        field.hidden = false;
                    }
                });

                if(!firstVisibleDataField && dataField.fieldCount > 0) {
                    firstVisibleDataField = dataField;
                }

                if(dataField.fieldCount === 0 && dataField === this.selectedDataField) {
                    this.selectedDataField = null;
                }
            });

            if(!this.selectedDataField && firstVisibleDataField) {
                this.selectedDataField = firstVisibleDataField;
            }
        }
        else {
            this.dataFields.forEach(dataField => {
                dataField.fieldCount = dataField.fields.length;
                dataField.fieldObjs.forEach(field => {
                    field.active = false;
                    field.hidden = false;
                });
            });

            if(!this.selectedDataField) {
                this.selectedDataField = this.dataFields[0];
            }
        }

        this.activateField();
    }

    activateField() {
        if(this.selectedDataField) {
            var field: { name: string, active?: boolean, hidden?: boolean };
            for(var i = 0; field = this.selectedDataField.fieldObjs[i]; i++) {
                if(!field.hidden) {
                    field.active = true;
                    break;
                }
            }
        }
    }

    processKeyCode() {
        if(this.searchKeyCode) {
            var field: { name: string, active?: boolean, hidden?: boolean };
            var lastIndex = this.selectedDataField.fieldObjs.length - 1;

            for(var i = 0; field = this.selectedDataField.fieldObjs[i]; i++) {
                if(field.active) {
                    if(this.searchKeyCode.down && i < lastIndex) {
                        field.active = false;
                        this.selectedDataField.fieldObjs[i + 1].active = true;
                    }
                    else if(this.searchKeyCode.up && i > 0) {
                        field.active = false;
                        this.selectedDataField.fieldObjs[i - 1].active = true;
                    }
                    else if(this.searchKeyCode.enter) {
                        this.selectField(this.selectedDataField.type, field.name);
                    }

                    break;
                }
            }
        }
    }

    selectDataField(dataField: DataField) {
        this.selectedDataField = dataField;

        this.dataFields.forEach(dataField => {
            dataField.fieldObjs.forEach(field => field.active = false);
        });

        this.activateField();
    }

    selectField(type: IndicatorParamType, field: string) {
        this.select.emit([type, DataFieldMap.toDisplayName(type, field)]);
    }

    getDisplayName(type: IndicatorParamType, field: string) {
        return DataFieldMap.toDisplayName(type, field);
    }

    getDictionary(type: IndicatorParamType, field: string) {
        return DataFieldMap.getDictionary(type, field);
    }
}

var dataFields = [{"_id":"54e2b524a9dfcb7c76196476","name":"Income Statement","type":1,"sort":1,"fields":["cgs","dep","dps","eps","epscon","epsd","epsdc","gopinc","gross","iac","inctax","int","intno","netinc","nit","othinc","perend","perlen","pertyp","pti","rd","sales","totexp","uninc","xord"]},{"_id":"54e2b524a9dfcb7c76196478","name":"Balance Sheet","type":2,"sort":2,"fields":["ap","ar","assets","ca","cash","cl","equity","gwi","inv","liab","ltdebt","nppe","oca","ocl","olta","oltl","pref","stdebt","totloe"]},{"_id":"54e2b524a9dfcb7c7619647a","name":"Cashflow Statement","type":3,"sort":3,"fields":["ce","dep_cf","ere","ncc","tcf","tci","tco"]},{"_id":"54e2b524a9dfcb7c7619647c","name":"Sentiment and Estimates","type":4,"sort":4,"fields":["avd_10d","beta","eps3m_eq0","eps3m_eq1","eps3m_ey0","eps3m_ey1","eps_eq0","eps_eq1","eps_ey0","eps_ey1","eps_lr","eps_rq2","epsdm_eq0","epsdm_eq1","epsdm_ey0","epsdm_ey1","epsh_eq0","epsh_eq1","epsh_ey0","epsh_ey1","epsl_eq0","epsl_eq1","epsl_ey0","epsl_ey1","epsn_eq0","epsn_eq1","epsn_ey0","epsn_ey1","epspm_eq0","epspm_eq1","epspm_ey0","epspm_ey1","epssd_eq0","epssd_eq1","epssd_ey0","epssd_ey1","epsum_eq0","epsum_eq1","epsum_ey0","epsum_ey1","insdps","insdss","instps","instss","mktcap","prchg_04w","prchg_13w","prchg_26w","prchg_52w","price","priceh_52w","pricel_52w","qs_eps","qs_sd","repdt_q0","shr_ay1","shrinsd","shrinst","sq2_eps","sq2_sd"]},{"_id":"54e2b524a9dfcb7c76196475","name":"Financial Indicators","type":11,"sort":5,"fields":["fscore","mscore","zscore"]},{"_id":"54e2b524a9dfcb7c76196477","name":"Short Interest","type":8,"sort":6,"fields":["days_cv","shrt_intr","vol"]},{"_id":"54e2b524a9dfcb7c76196479","name":"Technicals","type":6,"sort":7,"fields":["adl","aroond","aroonu","atr","bolllow","bollperc","bollup","close","daysd","daysu","emv","forcex","high","low","macd","macdsg","massx","mf","obv","open","ppo","pposg","prchg13wk","prchg1d","prchg1wk","prchg26wk","prchg4wk","prchg52wk","prh52wk","price","prl52wk","pvo","pvosg","rsi","sd100","sd20","sd200","sd50","sma100","sma20","sma200","sma50","sosfast","sosslow","srsi","tsi","ulcer","vol10","vol126","vol20","volDS10","volDS126","volDS20"]},{"_id":"54e2b524a9dfcb7c7619647b","name":"FRED","type":7,"sort":8,"fields":["ALTSALES","AMTMNO","ANFCI","BAMLC0A1CAAAEY","BAMLC0A4CBBBEY","BAMLH0A0HYM2EY","BAMLH0A3HYCEY","CBI","CIVPART","CPIAUCSL","DCOILBRENTEU","DCOILWTICO","GASPRICE","GDP","MORTGAGE30US","NAPM","NAPMEI","NAPMEXI","NAPMII","NAPMNOI","NMFBAI","NMFCI","PAYEMS","PPIACO","RRSFS","RSAFS","RSXFS","SPCS20RSA","STLFSI","TWEXM","UMCSENT","UMTMTI","UNRATE","USD3MTD156N","USREC","USSLIND","WAAA","WBAA","WFII10","WFII30","WFII5","WGS10YR","WGS1YR","WGS2YR","WGS30YR","WGS3MO","WGS5YR"]}];