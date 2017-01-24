import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { SlidingNavComponent } from '../sliding-nav/sliding-nav.component';

@NgModule({
    declarations: [
        SlidingNavComponent
    ],
    imports: [SharedModule],
    exports: [SlidingNavComponent]
})
export class NavigationSharedModule {}