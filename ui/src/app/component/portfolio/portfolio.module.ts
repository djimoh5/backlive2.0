import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { PortfolioSharedModule } from './shared/shared.module';

import { PortfolioComponent } from './portfolio.component';

@NgModule({
    declarations: [
        PortfolioComponent
    ],
    imports: [SharedModule, PortfolioSharedModule],
    exports: [PortfolioComponent]
})
export class PortfolioModule {}