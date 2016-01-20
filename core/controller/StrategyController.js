var BaseController = require("./BaseController.js");
var StrategyService = require("../service/StrategyService.js");

function StrategyController() {
	BaseController.call(this, { strategyService: StrategyService });
	
	this.index = function(req, res) {
        res.services.strategyService.getBacktest().done(function(res) {
			res.send(res);
		});
	}
    
    this.post[':backtestId'] = function(req, res) {
        res.services.strategyService.getBacktest(req.params.backtestId, req.body.name).done(function(res) {
			res.send(res);
		});
	}
    
    this.delete[':backtestId'] = function(req, res) {
        res.services.strategyService.removeBacktest(req.params.backtestId).done(function(res) {
			res.send(res);
		});
	}
    
    this.post[':backtestId/share'] = function(req, res) {
        res.services.strategyService.shareBacktest(req.params.backtestId, req.body.username, req.body.isPublic).done(function(res) {
			res.send(res);
		});
	}
    
    this[':backtestId/automate'] = function(req, res) {
        res.services.strategyService.getAutomatedStrategy(req.params.backtestId).done(function(res) {
			res.send(res);
		});
	}
    
    this.post[':backtestId/automate'] = function(req, res) {
        res.services.strategyService.automateStrategy(req.params.backtestId, req.body.startCapital).done(function(res) {
			res.send(res);
		});
	}
    
    this.delete[':backtestId/automate'] = function(req, res) {
        res.services.strategyService.stopAutomation(req.params.backtestId).done(function(res) {
			res.send(res);
		});
	}
    
    this.delete[':backtestId/executed'] = function(req, res) {
        res.services.strategyService.stopAutomation(req.params.backtestId, req.body.date).done(function(res) {
			res.send(res);
		});
	}
}

StrategyController.inherits(BaseController);
module.exports = StrategyController;