import { Get, Post, Delete, BaseController, Request, Response } from './base.controller';
import { CryptoService } from '../service/crypto.service';

export class CryptoController extends BaseController {
	constructor() {
		super({ cryptoService: CryptoService });
	}

	@Get('products')
	products(req: Request, res: Response) {
		(<CryptoService>res.services.cryptoService).getProducts().then(data => {
			res.send(data);
		});
	}
	
	@Get(':product/order-book')
	orderBook(req: Request, res: Response) {
        (<CryptoService>res.services.cryptoService).getOrderBook(req.params.productid).then(data => {
			res.send(data);
		});
	}

	@Get(':productid/stats')
	stats24Hr(req: Request, res: Response) {
		(<CryptoService>res.services.cryptoService).get24HourStats(req.params.productid).then(data => {
			res.send(data);
		});
	}

	@Get(':productid/prices')
	historicalPrices(req: Request, res: Response) {
		(<CryptoService>res.services.cryptoService).getHistoricalPrices(req.params.productid, req.query.granularity || 3600).then(data => {
			res.send(data);
		});
	}
}