import { BaseRepository, Operations } from './base.repository';

import { DataField } from '../service/model/lookup.model';

export class DataFieldRepository extends BaseRepository {
    constructor() {
        super('fields');
    }

    getAll() : Promise<DataField[]> {
        return this.context.find({}, null, { sort: { sort: 1 } });
    }
}