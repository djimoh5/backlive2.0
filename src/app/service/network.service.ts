import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { NodeService } from './node.service';

import { Network } from 'backlive/service/model';

@Injectable()
export class NetworkService extends NodeService<Network> {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'network');
    }
}