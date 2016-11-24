import { BaseRepository, Operations } from './base.repository';

import { Indicator } from '../service/model/indicator.model';

export class IndicatorRepository extends BaseRepository {
    constructor() {
        super('indicator');
    }

    getByUserId(userId: string) : Promise<Indicator[]> {
        return this.context.find({ uid: userId }, null, { sort: { "_id": 1 } });
    }

    add(indicator: Indicator) {
        return this.context.insert(indicator, true);
    }

    update(indicator: Indicator) {
        return this.context.update({ _id: this.dbObjectId(indicator._id) }, indicator);
    }
}