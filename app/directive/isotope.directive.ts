import {Directive, ElementRef, Input, EventEmitter, OnInit, AfterViewInit} from 'angular2/core';

@Directive({
    selector: '[isotope]'
})
export class JIsotope implements AfterViewInit {
    @Input('isotope') itemSelector: string;
    @Input() layoutMode: string = 'masonry';
    
    elementRef: ElementRef;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
        console.log(elementRef)
    }
    
    ngAfterViewInit() {
        
        setTimeout(() => {
            console.log($(this.elementRef.nativeElement).find(this.itemSelector))
            var iso = new Isotope(this.elementRef.nativeElement, {
                itemSelector: this.itemSelector,
                layoutMode: this.layoutMode,
                percentPosition: true
            });
            
            console.log(iso);
        });
    }
}