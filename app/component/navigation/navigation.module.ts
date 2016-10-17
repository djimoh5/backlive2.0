import { NgModule } from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { HeaderNavComponent } from './header-nav/header-nav.component';
import { SlidingNavComponent } from './sliding-nav/sliding-nav.component';
import { FooterNavComponent } from './footer-nav/footer-nav.component';

@NgModule({
    declarations: [
        HeaderNavComponent, SlidingNavComponent, FooterNavComponent
    ],
    imports: [SharedModule],
    exports: [HeaderNavComponent, SlidingNavComponent, FooterNavComponent]
})
export class NavigationModule {}