import {Directive, ElementRef, EventEmitter, Output, OnInit} from 'angular2/angular2';
import {Common} from '../utility/common';

@Directive({
    selector: '[autocompleter]',
    inputs: [
        'data: autocompleter'
    ]
})
export class AutoCompleter implements OnInit {
    data: any;
    elementRef: ElementRef;
    @Output() onSelect:EventEmitter = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    onInit() {
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