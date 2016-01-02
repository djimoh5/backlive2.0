import {Directive, ElementRef, EventEmitter, Input, Output, OnInit} from 'angular2/core';
import {Common} from 'visanow/utility';

@Directive({
    selector: '[autocompleter]'
})
export class AutoCompleter implements OnInit {
    @Input('autocompleter') data: any;
    @Output() onSelect: EventEmitter<any> = new EventEmitter();
    
    elementRef: ElementRef;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngOnInit() {
        var $elem = $(this.elementRef.nativeElement);
        
        if(Common.isString(this.data)) {
            $elem.autocomplete({ serviceUrl: this.data, onSelect: (suggestion: any) => this.selected(suggestion) });
        }
        else {
            $elem.autocomplete({ lookup: this.data, onSelect: (suggestion: any) => this.selected(suggestion) });
        }
    }
    
    selected (suggestion: any) {
        this.onSelect.next(suggestion);
    }
}