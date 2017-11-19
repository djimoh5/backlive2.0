import { NodeController } from './node.controller';

import { Node } from '../service/model/node.model';

export class BasicNodeController extends NodeController<Node> {
	constructor() {
		super(null);
	}
}