import {Directive, ElementRef, Input, EventEmitter, OnInit, AfterViewInit} from '@angular/core';

declare var Isotope: any;

@Directive({
    selector: '[isotope]'
})
export class JIsotopeDirective implements AfterViewInit {
    @Input('isotope') itemSelector: string;
    @Input() layoutMode: string = 'masonry';
    
    elementRef: ElementRef;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
        console.log(elementRef)
    }
    
    ngAfterViewInit() {        
        setTimeout(() => {
            var iso = new Isotope(this.elementRef.nativeElement, {
                itemSelector: this.itemSelector,
                layoutMode: this.layoutMode,
                percentPosition: true
            });
            
            //console.log(iso);
        });
    }
}