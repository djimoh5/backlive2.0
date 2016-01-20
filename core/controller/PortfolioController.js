var BaseController = require("./BaseController.js");
var PortfolioService = require("../service/PortfolioService.js");

function PortfolioController() {
	BaseController.call(this, { portfolioService: PortfolioService });
	
	this.index = function(req, res) {
        res.services.portfolioService.getPortfolio().done(function(res) {
			res.send(res);
		});
	}
    
    this.post.trade = function(req, res) {
        res.services.portfolioService.addTrade(req.body.trade).done(function(res) {
			res.send(res);
		});
	}

    this.post.trades = function(req, res) {
        res.services.portfolioService.batchAddTrades(req.body.trades).done(function(res) {
			res.send(res);
		});
	}
    
    this.delete['trade/:tradeId'] = function(req, res) {
        res.services.portfolioService.removeTrade(req.param.tradeId).done(function(res) {
			res.send(res);
		});
	}

    this.clear = function(req, res) {
        res.services.portfolioService.clearPortfolio().done(function(res) {
			res.send(res);
		});
	}
}

PortfolioController.inherits(BaseController);
module.exports = PortfolioController;