import { BaseController, Get, Request, Response } from './base.controller';
import { NewsService } from '../service/news.service';

export class NewsController extends BaseController {
	constructor() {
		super({ newsService: NewsService });
	}

	@Get('custom')
	custom(req: Request, res: Response) {
        (<NewsService>res.services.newsService).getCustomFeed(req.query.rss).then(function(data) {
			res.send(data);
		});
	}

    @Get('market')
	market(req: Request, res: Response) {
        (<NewsService>res.services.newsService).getMarketNews().then(function(data) {
			res.send(data);
		});
	}
    
	@Get('cnbc')
    cnbc(req: Request, res: Response) {
        (<NewsService>res.services.newsService).getCNBCNews().then(function(data) {
			res.send(data);
		});
	}
    
    @Get('bloombergRadio')
	bloombergRadio(req: Request, res: Response) {
        (<NewsService>res.services.newsService).getBloombergRadio().then(function(data) {
			res.send(data);
		});
	}
    
    @Get('economist')
	economist(req: Request, res: Response) {
        (<NewsService>res.services.newsService).getEconomist().then(function(data) {
			res.send(data);
		});
	}
}

interface Services<T> {

}