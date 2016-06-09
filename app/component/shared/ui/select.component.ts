import {Component, ElementRef, Input, Output, EventEmitter, HostListener, AfterContentInit, AfterViewInit, AfterContentChecked, ContentChildren, QueryList, ViewChild} from '@angular/core';
import {Path} from 'backlive/config';
import {AppService} from 'backlive/service';

import {PlatformUI} from 'backlive/utility/ui';

import {FocusDirective} from 'backlive/directive';

@Component({
    selector: 'ui-select-option',
    template: `<div #selectOption class="select-option" [class.hidden]="hidden" (click)="onClick()">
                    <ng-content></ng-content>
               </div>`,
})
export class SelectOptionComponent implements AfterViewInit {
    @Input() value: any;
    @Output() clicked: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('selectOption') selectOptionRef;
     
    elementRef: ElementRef;
    platformUI: PlatformUI;
    
    text: string;
    hidden: boolean;
    hasSubscription: boolean;
    
    constructor (elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngAfterViewInit() {
        this.text = this.selectOptionRef.nativeElement.innerText;
    }
    
    onClick() {
        this.clicked.emit(true);
    }
}

@Component({
    selector: 'ui-select-category',
    template: `<div class="select-category">
                    <div class="title">{{title}}</div>
                    <ng-content></ng-content>
               </div>`
})
export class SelectCategoryComponent implements AfterContentInit {
    @Input() title: string;
    @ContentChildren (SelectOptionComponent) optionsList: QueryList<SelectOptionComponent>;
    options: SelectOptionComponent[] = [];
    
    ngAfterContentInit() {
        this.loadOptions();
        this.optionsList.changes.subscribe(() => this.loadOptions());
    }
    
    loadOptions() {
        this.options = this.optionsList.toArray();
    }
}

@Component({
    selector: 'ui-select',
    template: `<div #dropdown class="select-menu dropdown" [class.static]="static" [style.max-width.px]="width">
                    <div class="text-container {{size}}">
                        <input [focus]="focus" type="text" [(ngModel)]="optionText" class="form-control" [placeholder]="placeholder" (keyup)="searchOptions()" (click)="openMenu()" [readonly]="readonly" />
                    </div>
                    <span #dropdownToggle class="dropdown-toggle" data-toggle="dropdown"><ui-icon type="arrowDown" class="hover"></ui-icon></span>
                    <div class="options-container" [class.dropdown-menu]="!static">
                        <ng-content></ng-content>
                    </div>
               </div>`,
    directives: [FocusDirective]
})
export class SelectComponent implements AfterContentInit {
    @Input() value: any;
    @Input() readonly: boolean = false;
    @Input() placeholder: string = 'Search';
    @Input() disabled: boolean;
    @Input() static: boolean;
    @Input() size: string;
    @Input() width: number;    
    @Input() focus: boolean;
    
    @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
    
    @ViewChild('dropdown') dropdownRef;
    @ViewChild('dropdownToggle') dropdownToggleRef;
    @ContentChildren (SelectOptionComponent) optionsList: QueryList<SelectOptionComponent>;
    @ContentChildren (SelectCategoryComponent) categorysList: QueryList<SelectCategoryComponent>;
    options: SelectOptionComponent[];

    elementRef: ElementRef;
    platformUI: PlatformUI;
    
    optionText: string = '';
    
    constructor (elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngAfterContentInit() {
        this.loadOptions();
        this.optionsList.changes.subscribe(() => this.loadOptions());
    }
    
    loadOptions() {
        this.options = [];
        
        this.categorysList.toArray().forEach(category => {
            category.options.forEach(option => {
                this.options.push(option);
            });
        });
        
        this.optionsList.toArray().forEach(option => {
            this.options.push(option);
        });
        
        this.options.forEach(option => {
            if (option.value === this.value) {
                this.optionText = option.text;
            }
            
            if(!option.hasSubscription) {
                option.clicked.subscribe(() => this.selectOption(option));
                option.hasSubscription = true;
            }
        });
    }
    
    openMenu() {
        if(!this.platformUI.query(this.dropdownRef.nativeElement).hasClass('open')) {
            this.dropdownToggleRef.nativeElement.click();
        }
    }
    
    selectOption(option: SelectOptionComponent) {
        this.optionText = option.text;
        this.value = option.value;
        this.valueChange.emit(option.value);
    }
    
    searchOptions() {
        this.openMenu();
        if(this.optionText != null && this.optionText.length > 0) {
            var term = this.optionText.toLowerCase();
            
            this.options.forEach(option => {
                option.hidden = true;
                if(option.text.toLowerCase().indexOf(term) >= 0) {
                    option.hidden = false;
                }
            });
        }
        else {
            this.options.forEach(option => option.hidden = false);
        }
    }
}