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

	@Post(':backtestid')
    saveBacktest(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).saveBacktest(req.params.backtestid, req.body.name).then(function(strategy) {
			res.send(strategy);
		});
	}
    
	@Delete(':backtestid')
    removeBacktest(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).removeBacktest(req.params.backtestid).then(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestid/share')
    shareBacktest(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).shareBacktest(req.params.backtestid, req.body.username, req.body.isPublic).then(function(data) {
			res.send(data);
		});
	}
    
	@Get(':backtestid/automate')
    getAutomatedStrategy(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).getAutomatedStrategy(req.params.backtestid).then(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestid/automate')
    automateStrategy(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).automateStrategy(req.params.backtestid, req.body.startCapital).then(function(data) {
			res.send(data);
		});
	}
    
	@Delete(':backtestid/automate')
    stopAutomation(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).stopAutomation(req.params.backtestid).then(function(res) {
			res.send(res);
		});
	}
    
	@Delete(':backtestid/executed')
    markStrategyAsExecuted(req: Request, res: Response) {
        (<StrategyService>res.services.nodeService).markStrategyAsExecuted(req.params.backtestid, req.body.date).then(function(res) {
			res.send(res);
		});
	}
}