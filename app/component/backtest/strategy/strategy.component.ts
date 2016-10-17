import {Component} from '@angular/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {AppEvent, Indicator} from 'backlive/service/model';

@Component({
    selector: 'app-strategy',
    templateUrl: Path.ComponentView('backtest/strategy')
})
export class StrategyComponent extends BaseComponent {
    indicators: Indicator[];
    
    constructor(appService: AppService) {
        super(appService);
    }
    
    onReadOnlyChange(readonly: boolean, collection: Indicator[]) {
        if(!readonly) {
            this.setAllReadonly(collection);
        }
    }
    
    setAllReadonly(indicators: Indicator[]) {
        for(var i = indicators.length - 1; i >= 0; i--) {
            indicators[i].readonly = true;
            if(indicators[i].vars[0] && indicators[i].vars[0] instanceof Indicator) {
                this.setAllReadonly(<Indicator[]> indicators[i].vars);
            }
        }
    }
    
    addIndicator(collection: Indicator[]) {
        var indicator = new Indicator();
        indicator.readonly = false;
        collection.splice(0, 0, indicator);
        this.setAllReadonly(collection);
    }
    
    groupIndicator(index: number, indicator: Indicator, collection: Indicator[]) {
        if(indicator.compareOn) {
            indicator.compareOn = false;
        }
        else {
            var found: Indicator;
            var foundIndex: number = -1;
            
            for(var i = 0, len = collection.length; i < len; i++) {
                if(collection[i].compareOn) {
                    found = collection[i];
                    foundIndex = i;
                    break;
                }
            }
            
            if(foundIndex >= 0) {
                var indGroup = new Indicator();
                indicator.readonly = false;
                this.setAllReadonly(collection);
                
                var firstIndex: number, lastIndex: number;
                var firstIndicator: Indicator, lastIndicator: Indicator;
                
                if(index < foundIndex) {
                    firstIndex = index;
                    lastIndex = foundIndex;
                    firstIndicator = indicator;
                    lastIndicator = found;   
                }
                else {
                    firstIndex = foundIndex;
                    lastIndex = index;
                    firstIndicator = found;
                    lastIndicator = indicator;   
                }
                
                collection.splice(firstIndex, 1);
                collection.splice(lastIndex, 1);
                
                indGroup.vars.push(firstIndicator, lastIndicator);
                collection.splice(firstIndex, 0, indGroup);

                indGroup.ops[0] = 0;
                
                firstIndicator.compareOn = lastIndicator.compareOn = false;
            }
            else {
                indicator.compareOn = true;
            }
        }
    }
    
    removeIndicator(index: number, collection: Indicator[]) {
        collection.splice(index, 1);
    }
}