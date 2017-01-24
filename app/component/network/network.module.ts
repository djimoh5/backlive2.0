import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from '../navigation/shared/shared.module';

import { NetworkComponent } from './network.component';
import { StrategyComponent } from '../strategy/strategy.component';
import { IndicatorComponent } from '../indicator/indicator.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';

import { networkRouting } from './network.routing';

@NgModule({
    declarations: [
        NetworkComponent, StrategyComponent, IndicatorComponent, PortfolioComponent
    ],
    imports: [SharedModule, NavigationSharedModule, networkRouting]
})
export class NetworkModule {}