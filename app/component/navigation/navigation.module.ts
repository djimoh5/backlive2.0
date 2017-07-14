import { NgModule } from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from './shared/shared.module';
import { NetworkSharedModule } from '../network/shared/shared.module';

import { HeaderNavComponent } from './header-nav/header-nav.component';

@NgModule({
    declarations: [
        HeaderNavComponent
    ],
    imports: [SharedModule, NavigationSharedModule, NetworkSharedModule],
    exports: [HeaderNavComponent, NavigationSharedModule]
})
export class NavigationModule {}