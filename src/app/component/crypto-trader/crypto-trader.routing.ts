import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'backlive/auth';

import { CryptoTraderComponent } from './crypto-trader.component';

export const routes: Routes = [
    { path: '', component: CryptoTraderComponent, canActivate: [AuthGuard] }
];

export const cryptoTraderRouting = RouterModule.forChild(routes);