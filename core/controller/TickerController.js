var BaseController = require("./BaseController.js");
var TickerService = require("../service/TickerService.js");

function TickerController() {
	BaseController.call(this, { tickerService: TickerService });

	this[':ticker/prices'] = function (req, res) {
		res.services.tickerService.getPrices(req.params.ticker, req.query.years).done(function(prices) {
			res.send(prices);
		});
	};
}

TickerController.inherits(BaseController);
module.exports = TickerController;