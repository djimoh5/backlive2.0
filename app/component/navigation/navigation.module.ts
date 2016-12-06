import { NgModule } from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { HeaderNavComponent } from './header-nav/header-nav.component';
import { SlidingNavComponent } from './sliding-nav/sliding-nav.component';
import { FooterNavComponent } from './footer-nav/footer-nav.component';
import { FooterModalComponent } from './footer-nav/modal/modal.component';

@NgModule({
    declarations: [
        HeaderNavComponent, SlidingNavComponent, FooterNavComponent, FooterModalComponent
    ],
    imports: [SharedModule],
    exports: [HeaderNavComponent, SlidingNavComponent, FooterNavComponent]
})
export class NavigationModule {}