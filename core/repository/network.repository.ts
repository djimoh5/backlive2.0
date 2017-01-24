import { BaseRepository, Operations } from './base.repository';
import { NodeRepository, NodeType } from './node.repository';

import { Network } from '../service/model/network.model';

export class NetworkRepository extends NodeRepository<Network> {
    constructor() {
        super(NodeType.Network);
    } 
}