import { BaseController } from './controller/base.controller';
import { HomeController } from './controller/home.controller';
import { IndicatorController } from './controller/indicator.controller';
import { StrategyController } from './controller/strategy.controller';

export var routes: RouteInfo[] = [
    //Pages
	{ path: '/', controller: HomeController },
    /*{ path: '/strategy', controller: require('./controller/HomeController') },
    { path: '/dashboard', controller: require('./controller/HomeController') },
    { path: '/portfolio', controller: require('./controller/HomeController') },
    { path: '/research', controller: require('./controller/HomeController') },*/
    
    //API Endpoints
	/*{ path: '/api/user', controller: require('./controller/UserController') },
    { path: '/api/ticker', controller: require('./controller/TickerController') },*/
    { path: '/api/indicator', controller: IndicatorController },
    //{ path: '/api/news', controller: require('./controller/NewsController') },
    //{ path: '/api/portfolio', controller: require('./controller/PortfolioController') },
    { path: '/api/strategy', controller: StrategyController },
];

export interface RouteInfo {
    path: string;
    controller: typeof BaseController;
}