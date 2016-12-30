import { BaseController, Get, Post, Delete } from './base.controller';
import { NodeController } from './node.controller';
import { PortfolioService } from '../service/portfolio.service';

import { Portfolio } from '../service/model/portfolio.model';

export class PortfolioController extends NodeController<Portfolio> {
	constructor() {
		super(PortfolioService);
	}

	/*@Get('')
	getPortfolios(req, res) {
        res.services.portfolioService.getPortfolio().done(function(portfolio) {
			res.send(portfolio);
		});
	}
    
	@Post('trade')
    trade(req, res) {
        res.services.portfolioService.addTrade(req.body.trade).done(function(data) {
			res.send(data);
		});
	}

	@Post('trades')
    trades(req, res) {
        res.services.portfolioService.batchAddTrades(req.body.trades).done(function(data) {
			res.send(data);
		});
	}
    
	@Delete('trade/:tradeId')
    removeTrade(req, res) {
        res.services.portfolioService.removeTrade(req.param.tradeId).done(function(data) {
			res.send(data);
		});
	}

	@Post('clear')
    clear(req, res) {
        res.services.portfolioService.clearPortfolio().done(function(data) {
			res.send(data);
		});
	}*/
}