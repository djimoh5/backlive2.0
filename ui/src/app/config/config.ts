import { environment } from '../../environments/environment';

export class Config {
    static Development: boolean = !environment.production;
    static AccountRouteKey: string = 'loginAccountId';
	static ClientEventQueueId: string = 'clientEventQueue';
    static ServerEventQueueId: string = 'serverEventQueue';

    static SITE_URL: string = '';
    static BASE_URL: string = '/';
    static CACHE_EXPIRATION: number = environment.production? 300 : 300; //in seconds
	static SHOW_ERRORS: boolean = !environment.production;
	static APP_CRASHED: string = null;
}