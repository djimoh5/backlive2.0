import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppService } from './app.service';

import { DataField } from 'backlive/service/model';

@Injectable()
export class LookupService extends BaseService {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'lookup');
    }
    
    getDataFields() : Promise<DataField[]> {
        return this.get('data/fields', null, true, { expiration: 86400 });
    }
}