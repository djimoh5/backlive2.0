import {Directive, ElementRef, Input, EventEmitter, OnInit, AfterViewInit} from 'angular2/core';

@Directive({
    selector: '[readmore]'
})
export class ReadMore implements AfterViewInit {
    @Input('readmore') height: string;
    elementRef: ElementRef;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngAfterViewInit() {
        $(this.elementRef.nativeElement).readmore({
            speed: 300,
            collapsedHeight: parseInt(this.height),
            moreLink: '<a href="javascript: void(0)">read more</a>',
            lessLink: '<a href="javascript: void(0)">read less</a>'
        });
    }
}