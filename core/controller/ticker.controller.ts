import { BaseController, Get } from './base.controller';
import { TickerService } from '../service/ticker.service';
import { NewsService } from '../service/news.service';
import { IndicatorService } from '../service/indicator.service';
import { SECService } from '../service/sec.service';

export class TickerController extends BaseController {
	constructor() {
		super({ tickerService: TickerService, newsService: NewsService, indicatorService: IndicatorService, secService: SECService });
	}

	@Get(':ticker/prices')
	prices(req, res) {
		res.services.tickerService.getPrices(req.params.ticker, req.query.years).done(function (prices) {
			res.send(prices);
		});
	};

	@Get(':ticker/price')
	price(req, res) {
		res.services.tickerService.getPrice(req.params.ticker, req.query.date).done(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/lastprice')
	lastPrice(req, res) {
		res.services.tickerService.getLastPrice(req.params.ticker).done(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/news')
	news(req, res) {
		res.services.newsService.getCompanyNews(req.params.ticker).done(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/indicators')
	indicators(req, res) {
		res.services.indicatorService.getIndicatorsForTicker(req.params.ticker).done(function (price) {
			res.send(price);
		});
	};

	@Get(':ticker/sec')
	sec(req, res) {
		res.services.secService.getDocument(req.query.path).done(function (price) {
			res.send(price);
		});
	};
}