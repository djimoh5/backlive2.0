import { Get, Post, Delete } from './base.controller';
import { NodeController } from './node.controller';
import { StrategyService } from '../service/strategy.service';

import { Strategy } from '../service/model/strategy.model';

export class StrategyController extends NodeController<Strategy> {
	constructor() {
		super(StrategyService);
	}
	
	@Get('backtests')
	backtests(req, res) {
        res.services.nodeService.getBacktests().done(function(strategies) {
			res.send(strategies);
		});
	}
    
	@Post('returns')
    getReturns(req, res) {
        res.services.nodeService.getReturns(req.body.strategyIds, req.body.startDate, req.body.endDate).done(function(strategy) {
			res.send(strategy);
		});
	}

	@Post(':backtestId')
    saveBacktest(req, res) {
        res.services.nodeService.saveBacktest(req.params.backtestId, req.body.name).done(function(strategy) {
			res.send(strategy);
		});
	}
    
	@Delete(':backtestId')
    removeBacktest(req, res) {
        res.services.nodeService.removeBacktest(req.params.backtestId).done(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestId/share')
    shareBacktest(req, res) {
        res.services.nodeService.shareBacktest(req.params.backtestId, req.body.username, req.body.isPublic).done(function(data) {
			res.send(data);
		});
	}
    
	@Get(':backtestId/automate')
    getAutomatedStrategy(req, res) {
        res.services.nodeService.getAutomatedStrategy(req.params.backtestId).done(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestId/automate')
    automateStrategy(req, res) {
        res.services.nodeService.automateStrategy(req.params.backtestId, req.body.startCapital).done(function(data) {
			res.send(data);
		});
	}
    
	@Delete(':backtestId/automate')
    stopAutomation(req, res) {
        res.services.nodeService.stopAutomation(req.params.backtestId).done(function(res) {
			res.send(res);
		});
	}
    
	@Delete(':backtestId/executed')
    markStrategyAsExecuted(req, res) {
        res.services.nodeService.markStrategyAsExecuted(req.params.backtestId, req.body.date).done(function(res) {
			res.send(res);
		});
	}
}