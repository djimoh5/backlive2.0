// import all components that will be used as routes
import {SplashComponent} from '../component/home/splash/splash.component';
import {AccessDeniedComponent} from '../component/home/access-denied/access-denied.component';
import {DashboardComponent} from '../component/dashboard/dashboard.component';
import {ResearchComponent} from '../component/research/research.component';
import {BacktestComponent} from '../component/backtest/backtest.component';
import {PortfolioComponent} from '../component/portfolio/portfolio.component';

// define routes and map to components
import {RouteMap} from '../service/router-service';

export class Route {
	public static get Dashboard(): string[] { return ['/Dashboard'] };
	public static get Splash(): string[] { return ['/Splash'] };
    public static get AccessDenied(): string[] { return ['/Accessdenied'] };
	public static get Research(): string[] { return ['/Research'] };
	public static get Backtest(): string[] { return ['/Backtest'] };
	public static get Portfolio(): string[] { return ['/Portfolio'] };
}

export var RouteComponentMap: RouteMap[]  = [
	{ route: Route.Dashboard, component: DashboardComponent, isRoot: true },
	{ route: Route.Splash, component: SplashComponent, isPublic: true, isSplash: true },
	{ route: Route.AccessDenied, component: AccessDeniedComponent, isPublic: true, isDefault: true },
	{ route: Route.Research, component: ResearchComponent },
	{ route: Route.Backtest, component: BacktestComponent },
	{ route: Route.Portfolio, component: PortfolioComponent }
];