import { BaseController, Get, Post, Delete } from './base.controller';
import { NodeService } from '../service/node.service';
import { Node } from '../service/model/node.model';

export abstract class NodeController<T extends Node> extends BaseController {
    constructor(nodeService: typeof NodeService) {
	    var service: any = nodeService;
	    super({ nodeService: service });
    }

    @Get('list')
    list(req, res) {
        res.services.nodeService.getNodes().then(function (nodes) {
            res.send(nodes);
        });
    }

    @Post('')
    update(req, res) {
        res.services.nodeService.update(req.body).then(function (node) {
            res.send(node);
        });
    }

    @Delete(':id')
    remove(req, res) {
        res.services.nodeService.remove(req.params.id).then(function () {
            res.send();
        });
    }

    @Get(':id/inputs')
    inputs(req, res) {
        res.services.nodeService.getInputs(req.params.id).then(function (nodes) {
            res.send(nodes);
        });
    }
}