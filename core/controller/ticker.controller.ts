import { BaseController, Get, Request, Response } from './base.controller';
import { TickerService } from '../service/ticker.service';
import { NewsService } from '../service/news.service';
import { IndicatorService } from '../service/indicator.service';
import { SECService } from '../service/sec.service';

export class TickerController extends BaseController {
	constructor() {
		super({ tickerService: TickerService, newsService: NewsService, indicatorService: IndicatorService, secService: SECService });
	}

	@Get(':ticker/prices')
	prices(req: Request, res: Response) {
		(<TickerService>res.services.tickerService).getPrices(req.params.ticker, req.query.years).then(function (prices) {
			res.send(prices);
		});
	};

	@Get(':ticker/price')
	price(req: Request, res: Response) {
		(<TickerService>res.services.tickerService).getPrice(req.params.ticker, req.query.date).then(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/lastprice')
	lastPrice(req: Request, res: Response) {
		(<TickerService>res.services.tickerService).getLastPrice(req.params.ticker).then(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/news')
	news(req: Request, res: Response) {
		(<NewsService>res.services.newsService).getCompanyNews(req.params.ticker).then(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/indicators')
	indicators(req: Request, res: Response) {
		/*(<IndicatorService>res.services.indicatorService).getIndicatorsForTicker(req.params.ticker).done(function (price) {
			res.send(price);
		});*/
	};

	@Get(':ticker/sec')
	sec(req: Request, res: Response) {
		(<SECService>res.services.secService).getDocument(req.query.path).then(function (price) {
			res.send(price);
		});
	};
}