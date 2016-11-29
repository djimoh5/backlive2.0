import { BaseRepository, Operations } from './base.repository';
import { NodeRepository, NodeType } from './node.repository';

import { Indicator } from '../service/model/indicator.model';

export class IndicatorRepository extends NodeRepository<Indicator> {
    constructor() {
        super(NodeType.Indicator);
    } 
}