import { BaseService } from './base.service';
import { NodeRepository } from '../repository/node.repository';
import { Node, NodeType } from '../service/model/node.model';

import { ISession, User } from '../lib/session';
import { Common } from '../../app//utility/common';

export class NodeService<T extends Node> extends BaseService {
    private static idTypeMap: { [key: string]: NodeType } = {};
    nodeRepository: NodeRepository<T>;

    constructor(session: ISession, nodeRepository?: typeof NodeRepository) {
        var repo: any = nodeRepository;
        super(session, { nodeRepository: (repo ? repo : NodeRepository) });
    }

    getNodes() {
        return this.nodeRepository.getByUserId(this.user.uid);
    }

    update(node: T) {
        node.uid = this.session.user.uid;

        if(node._id) {
            return this.nodeRepository.update(node);
        }
        else {
            return this.nodeRepository.add(node);
        }
    }

    remove(nodeId: string) {
        return this.nodeRepository.remove(this.session.user.uid, nodeId);
    }

    getInputs(nodeId: string) {
        return this.nodeRepository.getInputs(this.user.uid, nodeId);
    }
}