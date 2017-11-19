import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { NodeService } from './node.service';

import { Indicator } from 'backlive/service/model';

@Injectable()
export class IndicatorService extends NodeService<Indicator> {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'indicator');
    }
}