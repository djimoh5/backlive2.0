declare var WEB_CONFIG: any;

export class Config {
    static Development: boolean = WEB_CONFIG.Development;
    static AccountRouteKey: string = 'loginAccountId';
	static ClientEventQueueId: string = 'clientEventQueue';
    static ServerEventQueueId: string = 'serverEventQueue';

    static SITE_URL: string = '';
    static BASE_URL: string = WEB_CONFIG.BaseUrl;
    static CACHE_EXPIRATION: number = WEB_CONFIG.Development ? 300 : 300; //in seconds
	static SHOW_ERRORS: string = WEB_CONFIG.ShowErrors;
    static PRE_CACHE_APP_ONLY: string = WEB_CONFIG.PreCacheAppOnly;
	static APP_CRASHED: string = null;
}