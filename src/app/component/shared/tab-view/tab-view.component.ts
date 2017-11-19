import {Component, ElementRef, Input, Output, OnChanges, EventEmitter, HostBinding, HostListener, ContentChildren, AfterContentInit, QueryList} from '@angular/core';

import {BaseComponent} from '../base.component';

import {AppService} from 'backlive/service';

@Component({
    selector: 'tab-link',
    template: `<ng-content></ng-content>`
})
export class TabComponent implements OnChanges {
    @Input() active;
    @Output() clicked: EventEmitter<any> = new EventEmitter<any>();
    elementRef: ElementRef;
    
    hasSubscription: boolean;
    
    constructor (elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    setActive(active: boolean) {
        this.active = active;
    }
    
    ngOnChanges() {
        if(this.active) {
            this.onClick(null);
        }
    }
     
    @HostBinding('class.active') get classActive() {
        return this.active;
    }
    
    @HostListener('click', ['$event.target'])
    onClick(event: any) {
        this.clicked.emit(event);
    }
}

@Component({
    selector: 'tab-content',
    template: `<div *ngIf="active"><ng-content></ng-content></div>`
})
export class TabContentComponent {
    @Input() active: boolean = false;
    constructor () {}
    
    setActive(active: boolean) {
        this.active = active;
    }
}
 
@Component({
    selector: 'tab-view',
    template: `<ng-content></ng-content>`
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
        this.loadTabs();
        this.tabList.changes.subscribe(() => this.loadTabs());
    }
    
    loadTabs() {
        this.tabs = this.tabList.toArray();
        this.tabContents = this.tabContentList.toArray();
        
        this.tabs.forEach((tab: TabComponent, index: number) => {
            if(tab.active) {
                setTimeout(() => this.activateContents(index));
            }
            
            if(!tab.hasSubscription) {
                tab.clicked.subscribe(event => this.tabClicked(index, event));
            }
        });
    }
    
    tabClicked(index: number, event: any = null) {
        this.tabs.forEach(tab => {
            tab.setActive(false);
        });
        
        this.tabs[index].setActive(true);
        this.activateContents(index);
    }
    
    activateContents(index: number) {
        this.tabContents.forEach(tabContent => {
            tabContent.setActive(false);
        });
        
        if(this.tabContents[index]) {
            this.tabContents[index].setActive(true);
        }
    }
}


