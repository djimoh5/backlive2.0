import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'backlive/auth';

import { DashboardComponent } from './dashboard.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [AuthGuard] }
];

export const dashboardRouting = RouterModule.forChild(routes);