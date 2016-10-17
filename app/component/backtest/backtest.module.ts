import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { BacktestComponent } from './backtest.component';
import { StrategyComponent } from './strategy/strategy.component';
import { IndicatorComponent } from './strategy/indicator/indicator.component';

import { backtestRouting } from './backtest.routing';

@NgModule({
    declarations: [
        BacktestComponent, StrategyComponent, IndicatorComponent
    ],
    imports: [SharedModule, backtestRouting]
})
export class BacktestModule {}