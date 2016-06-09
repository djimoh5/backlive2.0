import {Component, ElementRef, Input, Output, EventEmitter, HostListener, NgZone} from '@angular/core';
import {DropdownMenuComponent} from './dropdown-menu.component';
import {AppService} from 'backlive/service';

import {PlatformUI} from 'backlive/utility/ui';

@Component({
    selector: 'dropdown-button',
    template: `<div class="dropdown">
                    <button type="button" [class]="btnClass" [disabled]="disabled" [style.width]="width" (click)="buttonClicked($event)">
                        <ui-icon *ngIf="icon" [type]="icon" class="btn-icon-left"></ui-icon>{{title}}
                    </button>
                    <button type="button" [class]="btnClass" [class.dropdown-toggle]="true" [class.menu-icon]="true" [disabled]="disabled" data-toggle="dropdown">
                        <ui-icon type="arrowDown"></ui-icon>
                    </button>
                    <div class="dropdown-menu" [style.width]="menuWidth">
                        <ng-content></ng-content>
                    </div>
               </div>`
})
export class DropdownButtonComponent extends DropdownMenuComponent {
    @Input() title: string;
    @Input() type: string;
    @Input() size: string;
    @Input() width: string;
    @Input() disabled: boolean;
    @Input() icon: string;
    @Input() autoClose: boolean = true;
    @Input() menuWidth: string;
    
    @Output() onClick: EventEmitter<Event> = new EventEmitter();

    constructor(appService: AppService, elementRef: ElementRef, platformUI: PlatformUI, ngZone: NgZone) {
        super(appService, elementRef, platformUI, ngZone);
    }

    buttonClicked(evt: Event) {
        this.onClick.emit(evt);
    }
}