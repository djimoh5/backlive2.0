var BaseController = require("./BaseController.js");
var TickerService = require("../service/TickerService.js");
var NewsService = require("../service/NewsService.js");
var IndicatorService = require("../service/IndicatorService.js");
var SECService = require("../service/SECService.js");

function TickerController() {
	BaseController.call(this, { tickerService: TickerService, newsService: NewsService, indicatorService: IndicatorService, secService: SECService });

	this[':ticker/prices'] = function (req, res) {
		res.services.tickerService.getPrices(req.params.ticker, req.query.years).done(function(prices) {
			res.send(prices);
		});
	};
    
    this[':ticker/price'] = function (req, res) {
		res.services.tickerService.getPrice(req.params.ticker, req.query.date).done(function(price) {
			res.send(price);
		});
	};
    
    this[':ticker/lastprice'] = function (req, res) {
		res.services.tickerService.getLastPrice(req.params.ticker).done(function(price) {
			res.send(price);
		});
	};
    
    this[':ticker/news'] = function (req, res) {
		res.services.newsService.getCompanyNews(req.params.ticker).done(function(price) {
			res.send(price);
		});
	};
    
    this[':ticker/indicators'] = function (req, res) {
		res.services.indicatorService.getIndicatorsForTicker(req.params.ticker).done(function(price) {
			res.send(price);
		});
	};
    
    this[':ticker/sec'] = function (req, res) {
		res.services.secService.getDocument(req.query.path).done(function(price) {
			res.send(price);
		});
	};
}

TickerController.inherits(BaseController);
module.exports = TickerController;