import {Directive, ElementRef, Input, AfterViewInit} from '@angular/core';

@Directive({
    selector: '[focus]',
})
export class FocusDirective implements AfterViewInit {
    @Input() focus: boolean;
    elementRef: ElementRef;

    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngAfterViewInit() {
        if(this.focus) {
            this.elementRef.nativeElement.focus();
        }
    }
}