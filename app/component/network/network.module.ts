import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from '../navigation/shared/shared.module';

import { StrategyModule } from '../strategy/strategy.module';
import { IndicatorModule } from '../indicator/indicator.module';

import { NetworkComponent } from './network.component';

import { PortfolioComponent } from '../portfolio/portfolio.component';
import { LibraryComponent } from './library/library.component';

import { networkRouting } from './network.routing';

@NgModule({
    declarations: [
        NetworkComponent, PortfolioComponent, LibraryComponent
    ],
    imports: [SharedModule, NavigationSharedModule, StrategyModule, IndicatorModule, networkRouting],
    entryComponents: [LibraryComponent]
    
})
export class NetworkModule {}