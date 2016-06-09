import {Component, Input, Output, OnChanges, HostBinding, EventEmitter, ElementRef, AfterViewInit, AfterContentInit, NgZone, ContentChildren, QueryList} from '@angular/core';
import {Path} from 'backlive/config';

import {BaseComponent} from 'backlive/component/shared';
import {AppService} from 'backlive/service';
import {Common} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

@Component({
    selector: 'ui-accordion',
    host: {'[id]': 'expandId'},
    template: `
        <div class="panel-heading" role="tab">
            <h4 class="panel-title">
                <a role="button" [class.collapsed]="!expand" data-toggle="collapse" [attr.data-parent]="idSelector()" [href]="collapseIdSelector()" [attr.aria-expanded]="expand" [attr.aria-controls]="collapseId">
                    <span class="title"><ng-content select="[header]"></ng-content></span>
                    <ui-icon type="arrowDown" class="icon-collapse" *ngIf="!empty"></ui-icon>
                    <ui-icon type="arrowRight" class="icon-collapse" *ngIf="!empty"></ui-icon>
                </a>
            </h4>
        </div>
        <div [id]="collapseId" class="panel-collapse collapse" [class.in]="expand" role="tabpanel" *ngIf="!empty">
            <div class="panel-body">
                <ng-content select="[body]"></ng-content>
            </div>
        </div>`,
    directives: []
})
export class AccordionComponent extends BaseComponent implements AfterViewInit {
    @Input() expand: boolean;
    @Input() empty: boolean;
    @Output() onClick: EventEmitter<any> = new EventEmitter();

    expandId: string;
    collapseId: string;
    panelGroupId: string;

    platformUI: PlatformUI;
    elementRef: ElementRef;
    ngZone: NgZone;

    constructor (appService: AppService, platformUI: PlatformUI, elementRef: ElementRef, ngZone: NgZone) {
        super(appService);
        this.platformUI = platformUI;
        this.elementRef = elementRef;
        this.ngZone = ngZone;

        this.expandId = 'acc-' + Common.uniqueId
        this.collapseId = this.expandId + 'Collapse';
    }

    ngAfterViewInit() {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.on('hidden.bs.collapse', (res) => {
            this.fireOnClick(false);
        });

        $elem.on('shown.bs.collapse', (res) => {
            this.fireOnClick(true);
        });
    }

    fireOnClick(open: boolean) {
        this.ngZone.run(() => {
            this.onClick.emit(open);
        });
    }

    idSelector() {
        return '#' + (this.panelGroupId ? this.panelGroupId : this.expandId);
    }

    collapseIdSelector() {
        return '#' + this.collapseId;
    }

    collapse(option: string) {
        var $elem = this.platformUI.query(this.elementRef.nativeElement).find('.panel-collapse');
        $elem.collapse(option);
    }

    @HostBinding('class.panel') get classPanel() {
        return true;
    }
}

@Component({
    selector: 'ui-accordion-group',
    template: `
        <div class="panel-group" [id]="panelGroupId" role="tablist" aria-multiselectable="true">
            <ng-content></ng-content>
        </div>`,
    directives: []
})
export class AccordionGroupComponent extends BaseComponent implements AfterContentInit {
    @Input() expand: boolean;
    
    @ContentChildren (AccordionComponent) accordionList: QueryList<AccordionComponent>;
    accordions: AccordionComponent[];

    panelGroupId: string;
    
    constructor (appService: AppService) {
        super(appService);
        this.panelGroupId = 'acc-group-' + Guid.NewGuid();
    }

    ngAfterContentInit() {
        this.loadAccordions();
        this.accordionList.changes.subscribe(() => this.loadAccordions());
    }

    loadAccordions() {
        this.accordions = this.accordionList.toArray();
        this.accordions.forEach(accordion => {
            accordion.panelGroupId = this.panelGroupId;
        });
    }
}