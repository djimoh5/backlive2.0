import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { PortfolioComponent } from './portfolio.component';
import { TickerComponent } from './ticker/ticker.component';

import { portfolioRouting } from './portfolio.routing';

@NgModule({
    declarations: [
        PortfolioComponent, TickerComponent
    ],
    imports: [SharedModule, portfolioRouting]
})
export class PortfolioModule {}