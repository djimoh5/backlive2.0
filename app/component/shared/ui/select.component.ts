import { Component, ElementRef, Input, Output, EventEmitter, HostListener, AfterContentInit, AfterViewInit, ContentChildren, QueryList, ViewChild, OnChanges, SimpleChanges, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

import { PlatformUI } from 'backlive/utility/ui';

@Component({
    selector: 'ui-select-option',
    template: `<div #selectOption class="select-option" [class.hidden]="hidden" [class.select-option-selected]="selected" (click)="onClick()">
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
    hidden: boolean = false;
    hasSubscription: boolean;

    selected: boolean;
    element: any;
    
    constructor (elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngAfterViewInit() {
        this.text = this.selectOptionRef.nativeElement.innerText;
        this.element = this.platformUI.query(this.selectOptionRef.nativeElement);
    }
    
    onClick() {
        this.clicked.emit(true);
    }

    topOffset() {
        return this.element.offset().top;
    }

    top() {
        return this.element.position().top;
    }

    height() {
        return this.element.height();
    }
}

@Component({
    selector: 'vn-select-category',
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
                        <input [focus]="focus" (blur)="onBlur()" type="text" [(ngModel)]="optionText" ngModelChange="setOption($event)" class="form-control" [placeholder]="placeholder" (focus)="onFocus()" (keyup)="searchOptions()" (click)="openMenu()" [readonly]="readonly" [disabled]="disabled"/>
                    </div>
                    <span #dropdownToggle class="dropdown-toggle" data-toggle="dropdown"><ui-icon type="arrowDown" class="hover"></ui-icon></span>
                    <div #dropdownList class="options-container" [class.dropdown-menu]="!static" [class.block]="blockDisplay">
                        <ng-content></ng-content>
                    </div>

               </div>`,
    styles: [
        `.options-container.block { position: 'relative'}`
    ],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => SelectComponent), multi: true }
    ]
})
export class SelectComponent implements OnChanges, ControlValueAccessor, Validator, AfterViewInit, AfterContentInit {
    @Input('ngModel') model: any;
    @Input() value: any;
    @Input() readonly: boolean = false;
    @Input() placeholder: string = 'Search';
    @Input() disabled: boolean;
    @Input() static: boolean;
    @Input() blockDisplay: boolean;
    @Input() size: string;
    @Input() width: number;    
    @Input() focus: boolean;
    
    @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() blur: EventEmitter<any> = new EventEmitter<any>();
    
    @ViewChild('dropdown') dropdownRef;
    @ViewChild('dropdownToggle') dropdownToggleRef;
    @ViewChild('dropdownList') dropdownListRef;
    @ContentChildren(SelectOptionComponent) optionsList: QueryList<SelectOptionComponent>;
    @ContentChildren(SelectCategoryComponent) categorysList: QueryList<SelectCategoryComponent>;

    static MAX_CONTENT_CHECKS = 50;
    contentCheckCount = 0;

    options: SelectOptionComponent[];

    elementRef: ElementRef;
    platformUI: PlatformUI;
    dropdownListElement;
    
    optionText: string = '';
    optionSelected: boolean = false;
    optionSelectedText: string;

    private initialized: boolean = false;

    propagateChange: any = () => { };
    propagateTouch: any = () => { };

    searchIndex: number = -1;
    searchOption: SelectOptionComponent;

    constructor (elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
        this.options = [];
    }

    ngAfterViewInit() {
        this.dropdownListElement = this.platformUI.query(this.dropdownListRef.nativeElement);
    }
    
    ngAfterContentInit() {
        this.loadOptions();
        this.optionsList.changes.subscribe(() => this.loadOptions());
        this.categorysList.changes.subscribe(() => this.loadOptions());
        this.initialized = true;
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (this.initialized) {
            if (simpleChanges['model']) {
                this.setOption(this.model);
            }
            else {
                this.model = this.value;
                this.setOption(this.value);
            }
        }
    }

    writeValue(value: any) {
        if (value) {
            this.model = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn) {
        this.propagateTouch = fn;
    }

    validate(control: AbstractControl) {
        if (!this.model && this.model !== 0) {
            return {
                validateValue: { valid: false }
            };
        }

        return null;
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
            if (!option.hasSubscription) {
                option.clicked.subscribe(() => this.selectOption(option));
                option.hasSubscription = true;
            }
        });
        
        this.setOptionToModel();
    }

    setOptionToModel() {
        if (this.model) {
            this.setOption(this.model);
        }
        else {
            this.setOption(this.value);
        }
    }

    setOption(value: any) {
        var selectedOption: SelectOptionComponent;

        this.options.forEach(option => {
            if (option.value === value) {
                this.optionText = ((option.text)) ? (option.text).trim() : (option.text);
                selectedOption = option;
            }
        });

        if (!selectedOption && value) {
            this.model = null;
            this.value = null;
            this.optionText = '';
            this.optionSelected = false;
        }
        else if(value) {
            this.optionSelected = true;
            this.optionSelectedText = this.optionText;
        }
    }
    
    openMenu() {
        if(!this.platformUI.query(this.dropdownRef.nativeElement).hasClass('open')) {
            this.dropdownToggleRef.nativeElement.click();
        }
    }

    closeMenu() {
        if (this.platformUI.query(this.dropdownRef.nativeElement).hasClass('open')) {
            this.dropdownToggleRef.nativeElement.click();
        }
    }
    
    selectOption(option: SelectOptionComponent) {
        this.optionText = option.text ? option.text.trim() : option.text;
        this.optionSelectedText = this.optionText;
        this.value = option.value;
        this.valueChange.emit(option.value);
        this.model = option.value;
        this.ngModelChange.emit(option.value);
        this.optionSelected = true;
        this.propagateChange(this.model);
        this.propagateTouch(this.model);
        this.resetSearch();
    }

    clearCurrentOption() {
        if (this.optionSelected) {
            this.optionSelectedText = this.optionText;
            this.optionText = '';
        }
        this.openMenu();
        this.resetSearch();
    }

    onFocus() {
        this.clearCurrentOption();
    }

    onBlur() {
        if (this.optionSelected) {
            this.optionText = this.optionSelectedText;
        }
        else {
            this.emptyOption();
        }
        this.clearSearch();
        this.blur.emit();
        this.propagateTouch(this.model);
    }

    emptyOption() {
        var emptyState = null;
        this.optionText = '';
        this.value = emptyState;
        this.model = emptyState;
        this.propagateChange(this.model);
    }

    clearSearch() {
        this.clearSearchOption();
        this.searchOption = null;
        this.searchIndex = -1;
    }

    @HostListener('keyup', ['$event'])
    onKeyup(e: KeyboardEvent) {
        var keyCode = e.keyCode ? e.keyCode : e.which;

        if (keyCode == 13 && this.searchOption) { //enter
            this.clearSearchOption();
            this.selectOption(this.searchOption);
            this.closeMenu();
            e.preventDefault();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(e: KeyboardEvent) {
        var keyCode = e.keyCode ? e.keyCode : e.which;

        if (keyCode === 8) { // backspace 
            this.clearSearch();
        }
        if (keyCode == 40) { // down
            if (this.options.length > 0 && this.options.length - 1 > this.searchIndex) {
                this.clearSearchOption();
                this.searchOption = this.options[++this.searchIndex];
                this.selectSearchOption(true);
            }
        }
        if (keyCode == 38) { // up
            if (this.options.length > 0 && this.searchIndex > 0) {
                if (this.searchIndex > this.options.length - 1) {
                    this.searchIndex = this.options.length - 1;
                }
                this.clearSearchOption();
                this.searchOption = this.options[--this.searchIndex];
                this.selectSearchOption(false);
            }
        }
    }

    clearSearchOption() {
        if (this.searchOption) {
            this.searchOption.selected = false;
        }
    }

    selectSearchOption(scrolledDown: boolean) {
        if (this.searchOption) {
            this.searchOption.selected = true;
            this.scrollToElement(this.searchIndex, this.searchOption, scrolledDown);
        }
    }

    scrollToElement(index: number, selectListItem: SelectOptionComponent, scrolledDown: boolean) {
        var elementTop = selectListItem.top();
        var scrollTop = this.dropdownListElement.scrollTop();
        var scrollOffset = this.dropdownListElement.height() * .5;

        if (index == 0) {
            this.dropdownListElement.scrollTop(0);
        } else {
            this.dropdownListElement.scrollTop(
                elementTop - scrollOffset + scrollTop
            );
        }
    }

    searchOptions() {
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
            this.resetSearch();
        }
    }

    resetSearch() {
        this.options.forEach(option => option.hidden = false);
    } 
}