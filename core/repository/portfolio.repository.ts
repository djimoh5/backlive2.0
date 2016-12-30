import { BaseRepository, Operations } from './base.repository';
import { NodeRepository, NodeType } from './node.repository';

import { Portfolio } from '../service/model/portfolio.model';

export class PortfolioRepository extends NodeRepository<Portfolio> {
    constructor() {
        super(NodeType.Portfolio);
    } 
}