import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { PageComponent } from '../../shared/page.component';

import { AppService, UserService, NetworkService, IndicatorService } from 'backlive/service';

import { Node, NodeType, Indicator } from 'backlive/service/model';

import { Common } from 'backlive/utility';

@Component({
    selector: 'backlive-network-library',
    templateUrl: 'library.component.html',
    styleUrls: ['library.component.less']
})
export class LibraryComponent extends PageComponent implements OnInit {
    @Output() select: EventEmitter<Node> = new EventEmitter<Node>();

    allNodes: Nodes[] = [];

    constructor(appService: AppService, private userService: UserService, private networkService: NetworkService, private indicatorService: IndicatorService) {
        super(appService);
    }

    ngOnInit() {
        Promise.all([this.networkService.list(), this.indicatorService.list()]).then(values => {
            values[1].splice(0, 0, new Indicator());
            this.allNodes.push({ type: NodeType.Indicator, nodes: values[1] });
            this.allNodes.push({ type: NodeType.Network, nodes: values[0] });
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