import { BaseRepository, Operations } from './base.repository';

import { Strategy } from '../service/model/strategy.model';

export class StrategyRepository extends BaseRepository {
    constructor() {
        super('user_strgy');
    }

    getByUserId(userId: string) : Promise<Strategy[]> {
        return this.context.find({ uid: userId }, null, { sort: { "_id": 1 } });
    }

    save(strategy: Strategy) {
        return this.context.insert(strategy, true);
    }

    update(strategy: Strategy) {
        return this.context.update({ _id: this.dbObjectId(strategy._id) }, strategy);
    }
}