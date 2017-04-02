import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { SlidingNavComponent } from '../sliding-nav/sliding-nav.component';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { FooterModalComponent } from '../footer-nav/modal/modal.component';

@NgModule({
    declarations: [
        SlidingNavComponent,
        FooterNavComponent,
        FooterModalComponent
    ],
    imports: [SharedModule],
    exports: [SlidingNavComponent, FooterNavComponent, FooterModalComponent]
})
export class NavigationSharedModule {}