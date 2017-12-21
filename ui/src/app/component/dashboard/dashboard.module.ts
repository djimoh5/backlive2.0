import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { PortfolioSharedModule } from '../portfolio/shared/shared.module';
import { NavigationSharedModule } from '../navigation/shared/shared.module';

import { DashboardComponent } from './dashboard.component';

import { dashboardRouting } from './dashboard.routing';

@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports: [SharedModule, PortfolioSharedModule, NavigationSharedModule, dashboardRouting]
})
export class DashboardModule {}