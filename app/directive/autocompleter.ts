import {Directive, ElementRef, EventEmitter, Output} from 'angular2/angular2';
import {Common} from '../utility/common';

@Directive({
    selector: '[autocompleter]',
    inputs: [
        'data: autocompleter'
    ]
})
export class AutoCompleter {
    data: any;
    @Output() onSelect:EventEmitter = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        var $elem = $(elementRef.nativeElement);
        
        setTimeout(() => { //inputs are not populated until after constructor is run
            if(Common.isString(this.data)) {
                $elem.autocomplete({ serviceUrl: this.data, onSelect: (suggestion: any) => this.selected(suggestion) });
            }
            else {
                $elem.autocomplete({ lookup: this.data, onSelect: (suggestion: any) => this.selected(suggestion) });
            }
        });
    }
    
    selected (suggestion: any) {
        this.onSelect.next(suggestion);
    }
}