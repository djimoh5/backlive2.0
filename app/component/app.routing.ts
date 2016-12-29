import { Routes, RouterModule } from '@angular/router';

import {RouterService} from 'backlive/service';
import {Config, AuthGuard} from 'backlive/config';

import {AccessDeniedComponent} from './home/access-denied/access-denied.component';
import {HomeComponent} from './home/home.component'

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    
    //lazy loaded modules
    { path: 'dashboard', loadChildren: 'app/component/dashboard/dashboard.module#DashboardModule' },
    { path: 'strategy', loadChildren: 'app/component/network/network.module#NetworkModule' },
    //{ path: 'portfolio', loadChildren: 'app/component/portfolio/portfolio.module#PortfolioModule'},
    { path: 'research', loadChildren: 'app/component/research/research.module#ResearchModule' },

    //catch all
    { path: '**', component: AccessDeniedComponent }
];

export const routing = RouterModule.forRoot(routes);