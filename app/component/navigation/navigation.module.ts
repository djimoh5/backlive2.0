import { NgModule } from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from './shared/shared.module';

import { HeaderNavComponent } from './header-nav/header-nav.component';
import { FooterNavComponent } from './footer-nav/footer-nav.component';
import { FooterModalComponent } from './footer-nav/modal/modal.component';

@NgModule({
    declarations: [
        HeaderNavComponent, FooterNavComponent, FooterModalComponent
    ],
    imports: [SharedModule, NavigationSharedModule],
    exports: [HeaderNavComponent, FooterNavComponent]
})
export class NavigationModule {}