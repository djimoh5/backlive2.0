import {Component, Input, Output, EventEmitter, HostListener, ContentChildren , AfterContentInit, QueryList} from 'angular2/core';
import {BaseComponent} from '../base.component';

import {AppService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';

@Component({
    selector: 'tab-item',
    template: `<ng-content></ng-content>`
})
export class TabComponent {
    @Input() active;
    @Output() clicked: EventEmitter<any> = new EventEmitter();
    
    constructor () {}
    
    @HostListener('click', ['$event.target'])
    onClick(event: any) {
        this.clicked.next(event);
    }
}

@Component({
    selector: 'tab-content',
    template: `<div [class.hidden]="!visible"><ng-content></ng-content></div>`
})
export class TabContentComponent {
    visible: boolean = false;
    constructor () {}
}


@Component({
    selector: 'tab-view',
    template: `<ng-content></ng-content>`,
    directives: [TabComponent, TabContentComponent]
})
export class TabViewComponent extends BaseComponent implements AfterContentInit {
    @ContentChildren (TabComponent) tabList: QueryList<TabComponent>;
    @ContentChildren (TabContentComponent) tabContentList: QueryList<TabContentComponent>;
    
    tabs: TabComponent[];
    tabContents: TabContentComponent[];
    
    constructor (appService:AppService) {
        super(appService);
    }
    
    ngAfterContentInit() {
        this.tabs = this.tabList.toArray();
        this.tabContents = this.tabContentList.toArray();
        
        this.tabs.forEach((tab: TabComponent, index: number) => {
            if(tab.active) {
                this.tabClicked(index);
            }
            
            tab.clicked.subscribe(event => this.tabClicked(index, event));
        });

        
        console.log(this.tabs, this.tabContents);
    }
    
    tabClicked(index: number, event: any = null) {
        console.log(index);
        this.tabContents.forEach(tabContent => {
            tabContent.visible = false;
        });
        
        this.tabContents[index].visible = true;
    }
}


