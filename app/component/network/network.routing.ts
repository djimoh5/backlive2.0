import { Routes, RouterModule } from '@angular/router';
import { Config, AuthGuard } from 'backlive/config';

import { NetworkComponent } from './network.component';

export const routes: Routes = [
    { path: '', component: NetworkComponent, canActivate: [AuthGuard] }
];

export const networkRouting = RouterModule.forChild(routes);