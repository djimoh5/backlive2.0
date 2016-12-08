import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { NetworkComponent } from './network.component';
import { StrategyComponent } from '../strategy/strategy.component';
import { IndicatorComponent } from '../indicator/indicator.component';

import { networkRouting } from './network.routing';

@NgModule({
    declarations: [
        NetworkComponent, StrategyComponent, IndicatorComponent
    ],
    imports: [SharedModule, networkRouting]
})
export class NetworkModule {}