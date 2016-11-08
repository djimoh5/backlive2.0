import { BaseNode } from '../base.node'
import { DataFilterEvent, IndicatorEvent } from '../../event/app.event';

import { Strategy as StrategyModel } from '../../../app/service/model/strategy.model';
import { Operator, Indicator as IndicatorModel, IndicatorParam } from '../../../app/service/model/indicator.model';
import { Common } from '../../../app//utility/common';

import { DataCache } from '../../node/data/data.node';

import { IndicatorNode } from '../indicator/indicator.node'
import { Calculator } from '../../lib/algorithm/calculator';

export class StrategyNode extends BaseNode {
    allIndicators: IndicatorModel[];
    calculator: Calculator;

    constructor(private model: StrategyModel) {
        super();
        var data = model.data;
        this.allIndicators = data.indicators.long.concat(data.indicators.short, data.exposure.long, data.exclusions);

        this.allIndicators.forEach(indModel => {
            new IndicatorNode(indModel);
        })

        this.calculator = new Calculator();

        this.subscribe(IndicatorEvent, event => this.processIndicator(event));
        this.notify(new DataFilterEvent({
            startDate: data.startYr, endDate: data.endYr,
            entities: (data.universeTkrs.incl === 1 && data.universeTkrs.tkrs && data.universeTkrs.tkrs.length > 0) ? data.universeTkrs.tkrs : null
        }));
    }

    processIndicator(event: IndicatorEvent) {
        console.log('Strategy received an indicator update', event);
    }

    getModel() {
        return this.model;
    }

}