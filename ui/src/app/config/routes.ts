import {RouteInfo} from 'backlive/service';

export class Route {
    static Home: RouteInfo = { path: '' };
    static AccessDenied: RouteInfo = { path: 'access-denid' };
    static Network: RouteInfo = { path: 'strategy' };
    static Strategy: RouteInfo = { path: 'strategy/:id' };
    static CryptoTrader: RouteInfo = { path: 'trader' };
    static Dashboard: RouteInfo = { path: 'dashboard' };
    static Portfolio: RouteInfo = { path: 'portfolio' };
    static Research: RouteInfo = { path: 'research' };
}