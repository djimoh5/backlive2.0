import { BaseController } from '../controller/base.controller';
import { HomeController } from '../controller/home.controller';
import { BasicNodeController } from '../controller/basic-node.controller';
import { NetworkController } from '../controller/network.controller';
import { IndicatorController } from '../controller/indicator.controller';
import { StrategyController } from '../controller/strategy.controller';
import { PortfolioController } from '../controller/portfolio.controller';
import { TickerController } from '../controller/ticker.controller';
import { UserController } from '../controller/user.controller';
import { LookupController } from '../controller/lookup.controller';
import { NewsController } from '../controller/news.controller';
import { CryptoController } from '../controller/crypto.controller';

export var routes: RouteInfo[] = [
    //Pages
    { path: '/strategy', controller: HomeController },
    { path: '/strategy/:id', controller: HomeController },
    { path: '/dashboard', controller: HomeController },
    { path: '/portfolio', controller: HomeController },
    { path: '/research', controller: HomeController },
    { path: '/trader', controller: HomeController },
    
    //API Endpoints
	{ path: '/api/user', controller: UserController },
    { path: '/api/ticker', controller: TickerController },
    { path: '/api/node', controller: BasicNodeController },
    { path: '/api/network', controller: NetworkController },
    { path: '/api/indicator', controller: IndicatorController },
    { path: '/api/news', controller: NewsController },
    { path: '/api/portfolio', controller: PortfolioController },
    { path: '/api/strategy', controller: StrategyController },
    { path: '/api/lookup', controller: LookupController },
    { path: '/api/crypto', controller: CryptoController },

    //must be last to prevent dup router middleware calls
    { path: '/', controller: HomeController }
];

export interface RouteInfo {
    path: string;
    controller: typeof BaseController;
}