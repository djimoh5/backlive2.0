import { NodeController } from './node.controller';
import { NetworkService } from '../service/network.service';

import { Network } from '../service/model/network.model';

export class NetworkController extends NodeController<Network> {
	constructor() {
		super(NetworkService);
	}
}