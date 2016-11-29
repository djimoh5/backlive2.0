import { BaseRepository, Operations } from './base.repository';
import { NodeRepository, NodeType } from './node.repository';

import { Strategy } from '../service/model/strategy.model';

export class StrategyRepository extends NodeRepository<Strategy> {
    constructor() {
        super(NodeType.Strategy);
    }
}