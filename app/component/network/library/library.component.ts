import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Path } from 'backlive/config';
import { PageComponent } from 'backlive/component/shared';

import { AppService, UserService, NetworkService, IndicatorService } from 'backlive/service';

import { Node, NodeType } from 'backlive/service/model';

import { Common } from 'backlive/utility';

@Component({
    selector: 'backlive-network-library',
    templateUrl: Path.ComponentView('network/library'),
    styleUrls: [Path.ComponentStyle('network/library')]
})
export class LibraryComponent extends PageComponent implements OnInit {
    @Output() select: EventEmitter<Node> = new EventEmitter<Node>();

    allNodes: Nodes[] = [];

    constructor(appService: AppService, private userService: UserService, private networkService: NetworkService, private indicatorService: IndicatorService) {
        super(appService);
    }

    ngOnInit() {
        this.networkService.list().then(networks => {
            this.allNodes.push({ type: NodeType.Network, nodes: networks });
        });

        this.indicatorService.list().then(indicators => {
            this.allNodes.push({ type: NodeType.Indicator, nodes: indicators });
        });
    }

    getName(type: NodeType) {
        return Common.camelCaseToWords(NodeType[type]);
    }

    onSelect(node: Node) {
        this.select.emit(node);
    }
 }

 export interface Nodes {
     type: NodeType;
     nodes: Node[];
 }