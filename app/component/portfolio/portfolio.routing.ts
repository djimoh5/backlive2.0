import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'backlive/config';

import { PortfolioComponent } from './portfolio.component';

export const routes: Routes = [
    { path: '', component: PortfolioComponent, canActivate: [AuthGuard] }
];

export const portfolioRouting = RouterModule.forChild(routes);