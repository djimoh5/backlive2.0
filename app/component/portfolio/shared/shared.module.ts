import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { TickerComponent } from '../ticker/ticker.component';

@NgModule({
    declarations: [
        TickerComponent
    ],
    imports: [SharedModule],
    exports: [TickerComponent]
})
export class PortfolioSharedModule {}
