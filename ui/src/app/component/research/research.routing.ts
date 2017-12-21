import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'backlive/auth';

import { ResearchComponent } from './research.component';

export const routes: Routes = [
    { path: '', component: ResearchComponent, canActivate: [AuthGuard] }
];

export const researchRouting = RouterModule.forChild(routes);