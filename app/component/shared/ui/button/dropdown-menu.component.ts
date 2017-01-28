import { Component, ElementRef, Input, Output, EventEmitter, HostListener, AfterViewInit, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from './button.component';
import { AppService } from 'backlive/service';

import { PlatformUI } from 'backlive/utility/ui'; 

@Component({
    selector: 'dropdown-menu',
    template: `<div class="dropdown" [ngClass]="activeFilter? 'active-filter':''" [ngClass]="open? 'open': ''">
                    <span class="custom-toggle" *ngIf="customToggle" data-toggle="dropdown">
                        <ng-content select="[toggle]"></ng-content>
                    </span>
                    <button type="button" *ngIf="useButton() && !customToggle" [class]="btnClass" [class.dropdown-toggle]="true" [disabled]="disabled" [style.width]="width" data-toggle="dropdown">
                        <ui-icon *ngIf="icon" [type]="icon" class="btn-icon-left"></ui-icon>{{title}}<ui-icon type="arrowDown" class="menu-icon btn-icon-right" [class.icon-only]="!title"></ui-icon>
                    </button>
                    <ui-icon *ngIf="!useButton()" class="hover" [type]="icon" data-toggle="dropdown"></ui-icon>
                    <div class="dropdown-menu" [class.pull-right]="openLeft" [style.width]="menuWidth" [ngStyle]="shiftMenu" [class.scroll]="scroll">
                        <ng-content></ng-content>
                    </div>
               </div>`
})
export class DropdownMenuComponent extends ButtonComponent implements AfterViewInit, OnChanges {
    @Input() title: string;
    @Input() type: string;
    @Input() size: string;
    @Input() width: string;
    @Input() disabled: boolean;
    @Input() activeFilter: boolean;
    @Input() icon: string;
    @Input() autoClose: boolean = true;
    @Input() menuWidth: string;
    @Input() open: boolean = false;
    @Input() openLeft: boolean = false;
    @Input() disableAutoPosition: boolean = false;
    @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() customToggle: boolean;
    @Input() scroll: boolean;

    shiftMenu: any;
    elementRef: ElementRef;
    platformUI: PlatformUI;
    ngZone: NgZone;

    constructor(appService: AppService, elementRef: ElementRef, platformUI: PlatformUI, ngZone: NgZone) {
        super(appService);
        this.elementRef = elementRef;
        this.platformUI = platformUI;
        this.ngZone = ngZone;
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        super.ngOnChanges(simpleChanges);
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

    useButton() {
        return this.title || !this.icon;
    }

    fireOnClick(open: boolean) {
        this.ngZone.run(() => {
            this.toggleChange.emit(open);
        });
    }
    
    setMenuPositionStyle(menuWidth, containerPos, x) {
        this.shiftMenu = null;
        if (menuWidth && containerPos && x) {
            if ((x + menuWidth) > containerPos) {
                this.shiftMenu = { left: '-' + (menuWidth - (containerPos - x)) + 'px' };
            }
        }
    }

    @HostListener('click', ['$event']) onMenuOpen(e) {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        var isOpen = $elem.find('.dropdown.open .dropdown-menu').length == 0 ? true : false;
        this.isOpenChange.emit(isOpen);

        if (!this.disableAutoPosition && !this.openLeft) {
            setTimeout(() => {
                var $container = $elem.closest('.dropdown-menu-container,table,body');
                if ($container.offset()) {
                    var containerPos = $container.offset().left + $container.width();
                }
                else {
                    var containerPos = $container.width();
                }
                var menuWidth = this.menuWidth ? parseInt(this.menuWidth.replace("px", "")) : $elem.find('.dropdown-menu').width();
                this.setMenuPositionStyle(menuWidth, containerPos, e.pageX);
            });
        }
    } 

    closeDropDown() {
        this.platformUI.query(this.elementRef.nativeElement).find('.dropdown.open').removeClass("open");
    }
}