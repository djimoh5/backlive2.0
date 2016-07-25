import {Directive, ElementRef, Input, Output, EventEmitter, OnInit, AfterViewInit} from '@angular/core';

declare var Isotope: any;

@Directive({
    selector: '[isotope]'
})
export class JIsotopeDirective implements AfterViewInit {
    @Input('isotope') itemSelector: string;
    @Input() layoutMode: string = 'masonry';
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    
    elementRef: ElementRef;
    iso: any;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngAfterViewInit() {        
        setTimeout(() => {
            this.iso = new Isotope(this.elementRef.nativeElement, {
                itemSelector: this.itemSelector,
                layoutMode: this.layoutMode,
                percentPosition: true
            });

            this.loaded.emit(this.iso);
        });
    }
    
    resize() {
        this.iso.resize();
    }
}