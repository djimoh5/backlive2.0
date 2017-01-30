import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { NodeService } from './node.service';

import { Node } from 'backlive/service/model';

@Injectable()
export class BasicNodeService extends NodeService<Node> {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'node');
    }
}