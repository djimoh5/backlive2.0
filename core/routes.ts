import { BaseController } from './controller/base.controller';
import { HomeController } from './controller/home.controller';
import { IndicatorController } from './controller/indicator.controller';
import { StrategyController } from './controller/strategy.controller';
import { TickerController } from './controller/ticker.controller';
import { UserController } from './controller/user.controller';

export var routes: RouteInfo[] = [
    //Pages
	{ path: '/', controller: HomeController },
    { path: '/strategy', controller: HomeController },
    { path: '/dashboard', controller: HomeController },
    { path: '/portfolio', controller: HomeController },
    { path: '/research', controller: HomeController },
    
    //API Endpoints
	{ path: '/api/user', controller: UserController },
    { path: '/api/ticker', controller: TickerController },
    { path: '/api/indicator', controller: IndicatorController },
    //{ path: '/api/news', controller: require('./controller/NewsController') },
    //{ path: '/api/portfolio', controller: require('./controller/PortfolioController') },
    { path: '/api/strategy', controller: StrategyController }
];

export interface RouteInfo {
    path: string;
    controller: typeof BaseController;
}