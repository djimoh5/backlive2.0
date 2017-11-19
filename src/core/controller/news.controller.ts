import { BaseController, Get } from './base.controller';
import { NewsService } from '../service/news.service';

export class NewsController extends BaseController {
	constructor() {
		super({ newsService: NewsService });
	}

	@Get('custom')
	custom(req, res) {
        res.services.newsService.customFeed(req.query.rss).done(function(data) {
			res.send(data);
		});
	}
    
    @Get('market')
	market(req, res) {
        res.services.newsService.getMarketNews().done(function(data) {
			res.send(data);
		});
	}
    
	@Get('cnbc')
    cnbc(req, res) {
        res.services.newsService.getCNBCNews().done(function(data) {
			res.send(data);
		});
	}
    
    @Get('bloombergRadio')
	bloombergRadio(req, res) {
        res.services.newsService.getBloombergRadio().done(function(data) {
			res.send(data);
		});
	}
    
    @Get('economist')
	economist(req, res) {
        res.services.newsService.getEconomist().done(function(data) {
			res.send(data);
		});
	}
}