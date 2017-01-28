import { NetworkRepository } from '../repository/network.repository';

import { NodeService } from './node.service';
import { ISession } from '../lib/session';

import { Network } from './model/network.model';

export class NetworkService extends NodeService<Network> {
    networkRepository: NetworkRepository;

    constructor(session: ISession) {
        super(session, NetworkRepository);
        this.networkRepository = this.nodeRepository;
    }
}