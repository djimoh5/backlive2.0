import {RouteInfo} from '../../service/router.service';

// import all components that will be used as routes
import {Path} from 'backlive/config';
import {AccessDeniedComponent} from '../../component/home/access-denied/access-denied.component';
import {DashboardComponent} from '../../component/dashboard/dashboard.component';
import {ResearchComponent} from '../../component/research/research.component';
import {BacktestComponent} from '../../component/backtest/backtest.component';
import {PortfolioComponent} from '../../component/portfolio/portfolio.component';

export class Route {
    static Dashboard: RouteInfo = {
        link: ['/Dashboard'], component: DashboardComponent, path: Path.ComponentRoute('dashboard'), isDefault: true, isRoot: true
    };
    static AccessDenied: RouteInfo = { 
        link: ['/Accessdenied', { id: null }], component: AccessDeniedComponent
    };
    static Research: RouteInfo = { 
        link: ['/Research', { id: null }], component: ResearchComponent
    };
    static Backtest: RouteInfo = { 
        link: ['/Backtest', { id: null }], component: BacktestComponent
    };
    static Portfolio: RouteInfo = { 
        link: ['/Portfolio', { id: null }], component: PortfolioComponent
    };
}