import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { User, Strategy, Node } from 'backlive/service/model';

@Injectable()
export class NodeService<T> extends BaseService {
    constructor(apiService: ApiService, appService: AppService, endpoint: string) {
        super(apiService, appService, endpoint);
    }

    list() : Promise<T[]>  {
        return this.get('list', null);
    }

    update(node: T) : Promise<T> {
        return this.post('', node);
    }

    remove(nodeId: string) {
        return this.delete(nodeId);
    }

    getInputs(nodeId: string) : Promise<Node[]> {
        return this.get(`${nodeId}/inputs`, null);
    }
}