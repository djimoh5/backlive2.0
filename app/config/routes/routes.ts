import {RouteInfo} from '../../service/router.service';

// import all components that will be used as routes
import {HomeComponent} from '../../component/home/home.component';
import {AccessDeniedComponent} from '../../component/home/access-denied/access-denied.component';
import {DashboardComponent} from '../../component/dashboard/dashboard.component';
import {ResearchComponent} from '../../component/research/research.component';
import {BacktestComponent} from '../../component/backtest/backtest.component';
import {PortfolioComponent} from '../../component/portfolio/portfolio.component';

export class Route {
    static Home: RouteInfo = {
        link: ['/'], component: HomeComponent
    };
    static Dashboard: RouteInfo = {
        link: ['/dashboard'], component: DashboardComponent
    };
    static AccessDenied: RouteInfo = { 
        link: ['/access-denied'], component: AccessDeniedComponent
    };
    static Research: RouteInfo = { 
        link: ['/research', { id: null }], component: ResearchComponent
    };
    static Backtest: RouteInfo = { 
        link: ['/backtest', { id: null }], component: BacktestComponent
    };
    static Portfolio: RouteInfo = { 
        link: ['/portfolio', { id: null }], component: PortfolioComponent
    };
}