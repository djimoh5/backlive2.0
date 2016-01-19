var BaseController = require("./BaseController.js");
var TickerService = require("../service/TickerService.js");

function TickerController() {
	BaseController.call(this, { tickerService: TickerService });

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
}

TickerController.inherits(BaseController);
module.exports = TickerController;