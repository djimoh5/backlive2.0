import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { AppService, NetworkService } from 'backlive/service';
import { Network, Node } from 'backlive/service/model';

import { OpenModalEvent } from 'backlive/event';

@Component({
    selector: 'network-list',
    templateUrl: Path.ComponentView('network/shared/list'),
    styleUrls: [Path.ComponentStyle('network/shared/list')]
})
export class NetworkListComponent extends BaseComponent implements OnInit {
    nodes: Node[];
    @Output() select: EventEmitter<Node> = new EventEmitter();
      
    constructor(appService: AppService, private networkService: NetworkService) {
        super(appService);
    }
    
    ngOnInit() {
        this.networkService.list().then(networks => {
            this.nodes = networks;
        });
    }

    selectNode(node: Node) {
        this.select.emit(node);
    }

    newNode() {
        var network = new Network(.5, 50, [3], null);
        this.networkService.update(network).then(network => {
            this.nodes.push(network);
            this.selectNode(network);
        });
    }

    confirmRemoveNode(node: Node) {
        this.appService.notify(new OpenModalEvent({
            title: 'Confirm Remove Network',
            body: 'Are you sure you want to remove this network?',
            onSubmit: () => this.removeNode(node)
        }));
    }

    removeNode(node: Node) {
        this.networkService.remove(node._id).then(success => {
            if(success) {
                this.nodes.splice(this.nodes.indexOf(node), 1);
            }
        });
    }
}