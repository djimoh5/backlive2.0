import { BaseRepository, Operations } from './base.repository';

import { Strategy } from '../service/model/strategy.model';

export class StrategyRepository extends BaseRepository {
    constructor() {
        super('strategy');
    }

    getByUserId(userId: string) : Promise<Strategy[]> {
        return this.context.find({ uid: userId }, null, { sort: { "_id": 1 } });
    }

    add(strategy: Strategy) {
        return this.context.insert(strategy, true);
    }

    update(strategy: Strategy) {
        return this.context.update({ _id: this.dbObjectId(strategy._id) }, strategy);
    }
}