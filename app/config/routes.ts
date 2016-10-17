import {RouteInfo} from 'backlive/service';

export class Route {
    static Home: RouteInfo = { path: '' };
    static AccessDenied: RouteInfo = { path: 'access-denid' };
    static Backtest: RouteInfo = { path: 'backtest' }
    static Dashboard: RouteInfo = { path: 'dashboard' };
    static Portfolio: RouteInfo = { path: 'portfolio' };
    static Research: RouteInfo = { path: 'research' };
}