import { BaseService } from './base.service';
import { DataFieldRepository } from '../repository/data-field.repository';

import { Session } from '../lib/session';
import { Common } from '../../app//utility/common';

export class LookupService extends BaseService {
    dataFieldRepository: DataFieldRepository;

    constructor(session: Session) {
        super(session, { dataFieldRepository: DataFieldRepository });
    }

    getDataFields() {
        return this.dataFieldRepository.getAll();
    }
}