import {Component, ElementRef, Input, Output, EventEmitter, HostListener, AfterViewInit, NgZone} from '@angular/core';
import {ButtonComponent} from './button.component';
import {AppService} from 'backlive/service';

import {PlatformUI} from 'backlive/utility/ui';

@Component({
    selector: 'dropdown-menu',
    template: `<div class="dropdown" [ngClass]="activeFilter? 'active-filter':''" [ngClass]="open? 'open': ''">
                    <button type="button" *ngIf="useButton()" [class]="btnClass" [class.dropdown-toggle]="true" [disabled]="disabled" [style.width]="width" data-toggle="dropdown">
                        <ui-icon *ngIf="icon" [type]="icon" class="btn-icon-left"></ui-icon>{{title}}<ui-icon type="arrowDown" class="menu-icon btn-icon-right" [class.icon-only]="!title"></ui-icon>
                    </button>
                    <ui-icon *ngIf="!useButton()" class="hover" [type]="icon" data-toggle="dropdown"></ui-icon>
                    <div class="dropdown-menu" [style.width]="menuWidth" [ngStyle]="shiftMenu" [ngClass]="shiftDirection">
                        <ng-content></ng-content>
                    </div>
               </div>`,
    inputs: ButtonComponent.inputs
})
export class DropdownMenuComponent extends ButtonComponent implements AfterViewInit {
    @Input() activeFilter: boolean;
    @Input() icon: string;
    @Input() autoClose: boolean = true;
    @Input() menuWidth: string;
    @Input() open: boolean = false;
    @Input() disableAutoPosition: boolean = false;
    @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    
    @HostListener('click', ['$event']) onMenuOpen(e) {
        if (!this.disableAutoPosition) {
            setTimeout(() => {
                var bodyWidth = this.platformUI.query('body') ? parseInt(this.platformUI.query('body').width()) : null;
                var menuWidth = this.menuWidth ? parseInt(this.menuWidth.replace("px", "")) :
                    (this.platformUI.query('.dropdown.open .dropdown-menu') ? parseInt(this.platformUI.query('.dropdown.open .dropdown-menu').width()) : null)
                this.setMenuPositionStyle(menuWidth, bodyWidth, e.pageX);
            });
        }
    }
    
    shiftMenu: any;
    shiftDirection: string;
    elementRef: ElementRef;
    platformUI: PlatformUI;
    ngZone: NgZone;

    constructor(appService: AppService, elementRef: ElementRef, platformUI: PlatformUI, ngZone: NgZone) {
        super(appService);
        this.elementRef = elementRef;
        this.platformUI = platformUI;
        this.ngZone = ngZone;
    }

    useButton() {
        return this.title || ! this.icon;
    }

    ngAfterViewInit() {
        if(!this.autoClose) {
            this.platformUI.query(this.elementRef.nativeElement).find('.dropdown-menu').click(function (e) {
                e.stopPropagation();
            });
        }

        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.on('hidden.bs.dropdown', (res) => {
            this.fireOnClick(false);
        });

        $elem.on('shown.bs.dropdown', (res) => {
            this.fireOnClick(true);
        });
    }

    fireOnClick(open: boolean) {
        this.ngZone.run(() => {
            this.toggleChange.emit(open);
        });
    }
    
    setMenuPositionStyle(menuWidth, bodyWidth, x) {
        var distToShiftLeft, distToShiftRight;
        this.shiftMenu = null;
        this.shiftDirection = null;
        
        if (menuWidth && bodyWidth && x) {
            if (x < menuWidth) {
                this.shiftDirection = "right";
                this.shiftMenu = { "right" : "-" + (menuWidth - 20) + "px" }
            }
            
            if ((bodyWidth - x) < menuWidth) {
                this.shiftDirection = "left";
                this.shiftMenu = { "left" : "-" + (menuWidth - 20) + "px" }
            }
        }
    }
}