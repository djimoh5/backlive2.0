import { BaseController, Get, Post, Delete, Request, Response } from './base.controller';
import { NodeService } from '../service/node.service';
import { Node } from '../service/model/node.model';

import { ISession } from '../lib/session';

export abstract class NodeController<T extends Node> extends BaseController {
    constructor(nodeService?: new(session: ISession, nodeRepository?) => NodeService<any>) {
	    var service: any = nodeService;
	    super({ nodeService: service ? service : NodeService });
    }

    @Get('list')
    list(req: Request, res: Response) {
        (<NodeService<any>>res.services.nodeService).getNodes().then(nodes => {
            res.send(nodes);
        });
    }

    @Post('')
    update(req: Request, res: Response) {
        (<NodeService<any>>res.services.nodeService).update(req.body).then(node => {
            res.send(node);
        });
    }

    @Delete(':id')
    remove(req: Request, res: Response) {
        (<NodeService<any>>res.services.nodeService).remove(req.params.id).then(result => {
            res.send(result);
        });
    }

    @Get(':id/inputs')
    inputs(req: Request, res: Response) {
        (<NodeService<any>>res.services.nodeService).getInputs(req.params.id).then(nodes => {
            res.send(nodes);
        });
    }
}