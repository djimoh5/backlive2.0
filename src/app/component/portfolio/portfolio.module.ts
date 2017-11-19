import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { PortfolioSharedModule } from './shared/shared.module';

import { PortfolioComponent } from './portfolio.component';

import { portfolioRouting } from './portfolio.routing';

@NgModule({
    declarations: [
        PortfolioComponent
    ],
    imports: [SharedModule, PortfolioSharedModule, portfolioRouting],
    exports: [PortfolioComponent]
})
export class PortfolioModule {}