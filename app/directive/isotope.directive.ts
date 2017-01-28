import {Directive, ElementRef, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';

declare var Isotope: any;

@Directive({
    selector: '[isotope]'
})
export class JIsotopeDirective implements AfterViewInit {
    @Input('isotope') itemSelector: string;
    @Input() layoutMode: string = 'masonry';
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    
    iso: any;
    
    constructor(private elementRef: ElementRef) {
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
    
    reLayout() {
        this.iso.$element.isotope('reLayout');
    }
}