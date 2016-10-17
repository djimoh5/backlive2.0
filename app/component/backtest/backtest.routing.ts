import { Routes, RouterModule } from '@angular/router';
import { Config, AuthGuard } from 'backlive/config';

import { BacktestComponent } from './backtest.component';

export const routes: Routes = [
    { path: '', component: BacktestComponent, canActivate: [AuthGuard] }
];

export const backtestRouting = RouterModule.forChild(routes);