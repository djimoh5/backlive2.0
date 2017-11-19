import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from '../navigation/shared/shared.module';

import { StrategyModule } from '../strategy/strategy.module';
import { IndicatorModule } from '../indicator/indicator.module';
import { PortfolioModule } from '../portfolio/portfolio.module';

import { NetworkComponent } from './network.component';


import { LibraryComponent } from './library/library.component';

import { networkRouting } from './network.routing';

@NgModule({
    declarations: [
        NetworkComponent, LibraryComponent
    ],
    imports: [
        SharedModule, NavigationSharedModule, StrategyModule, IndicatorModule, PortfolioModule, networkRouting
    ],
    entryComponents: [LibraryComponent]
    
})
export class NetworkModule {}