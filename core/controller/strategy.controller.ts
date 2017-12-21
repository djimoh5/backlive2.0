import { Get, Post, Delete, Request, Response } from './base.controller';
import { NodeController } from './node.controller';
import { StrategyService } from '../service/strategy.service';

import { Strategy } from '../service/model/strategy.model';

export class StrategyController extends NodeController<Strategy> {
	constructor() {
		super(StrategyService);
	}
	
	@Get('backtests')
	backtests(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).getBacktests().then(function(strategies) {
			res.send(strategies);
		});
	}
    
	@Post('returns')
    getReturns(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).getReturns(req.body.strategyIds, req.body.startDate, req.body.endDate).then(function(strategy) {
			res.send(strategy);
		});
	}

	@Post(':backtestId')
    saveBacktest(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).saveBacktest(req.params.backtestId, req.body.name).then(function(strategy) {
			res.send(strategy);
		});
	}
    
	@Delete(':backtestId')
    removeBacktest(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).removeBacktest(req.params.backtestId).then(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestId/share')
    shareBacktest(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).shareBacktest(req.params.backtestId, req.body.username, req.body.isPublic).then(function(data) {
			res.send(data);
		});
	}
    
	@Get(':backtestId/automate')
    getAutomatedStrategy(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).getAutomatedStrategy(req.params.backtestId).then(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestId/automate')
    automateStrategy(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).automateStrategy(req.params.backtestId, req.body.startCapital).then(function(data) {
			res.send(data);
		});
	}
    
	@Delete(':backtestId/automate')
    stopAutomation(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).stopAutomation(req.params.backtestId).then(function(res) {
			res.send(res);
		});
	}
    
	@Delete(':backtestId/executed')
    markStrategyAsExecuted(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).markStrategyAsExecuted(req.params.backtestId, req.body.date).then(function(res) {
			res.send(res);
		});
	}
}