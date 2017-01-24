import { BaseService } from './base.service';
import { NetworkRepository } from '../repository/network.repository';

import { NodeService } from './node.service';
import { Session, ISession } from '../lib/session';

import { Network } from './model/network.model';

export class NetworkService extends NodeService<Network> {
    networkRepository: NetworkRepository;

    constructor(session: ISession) {
        super(session, NetworkRepository);
        this.networkRepository = this.nodeRepository;
    }
}