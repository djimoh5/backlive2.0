var BaseController = require("./BaseController.js");
var PortfolioService = require("../service/PortfolioService.js");

function PortfolioController() {
	BaseController.call(this, { portfolioService: PortfolioService });
	
	this.index = function(req, res) {
        res.services.portfolioService.getPortfolio().done(function(portfolio) {
			res.send(portfolio);
		});
	}
    
    this.post.trade = function(req, res) {
        res.services.portfolioService.addTrade(req.body.trade).done(function(data) {
			res.send(data);
		});
	}

    this.post.trades = function(req, res) {
        res.services.portfolioService.batchAddTrades(req.body.trades).done(function(data) {
			res.send(data);
		});
	}
    
    this.delete['trade/:tradeId'] = function(req, res) {
        res.services.portfolioService.removeTrade(req.param.tradeId).done(function(data) {
			res.send(data);
		});
	}

    this.clear = function(req, res) {
        res.services.portfolioService.clearPortfolio().done(function(data) {
			res.send(data);
		});
	}
}

PortfolioController.inherits(BaseController);
module.exports = PortfolioController;